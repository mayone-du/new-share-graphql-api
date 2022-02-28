import { arg, extendType, inputObjectType, nonNull } from "nexus";
import { User } from "nexus-prisma";

import { CROWN_EMOJI } from "../../constants/statusEmoji";
import { getSlackUserStatus } from "../../feature/slack";
import { userObject } from "../";
import { unauthorized } from "../errors/messages";
import { DEVELOPER_GMAIL, DEVELOPER_ICLOUD_EMAIL } from "../../constants/email";

const updateMyUserInfoInput = inputObjectType({
  name: "UpdateMyUserInfoInput",
  definition: (t) => {
    t.nullable.field(User.displayName);
    t.nullable.field(User.selfIntroduction);
  },
});

export const userMutation = extendType({
  type: "Mutation",
  definition: (t) => {
    t.field("authUser", {
      type: userObject,
      resolve: async (_root, args, ctx, _info) => {
        if (!ctx.userContext.isAuthenticated) throw Error(unauthorized);
        // 認証済みだが、ユーザーが存在しない場合(初回ログインの場合)はユーザーを作成
        const slackUserStatus = await getSlackUserStatus(
          ctx.userContext.token,
          ctx.userContext.slackAuthTestResponse.user_id ?? "",
        );
        const isDeveloper =
          slackUserStatus.profile?.email === DEVELOPER_ICLOUD_EMAIL ||
          slackUserStatus.profile?.email === DEVELOPER_GMAIL;
        // 初回サインインの場合
        if (!ctx.userContext.user)
          return await ctx.prisma.user.create({
            data: {
              oauthUserId: ctx.userContext.slackAuthTestResponse.user_id,
              username: slackUserStatus.profile?.email ?? "",
              email: slackUserStatus.profile?.email ?? "",
              displayName: slackUserStatus.profile?.display_name ?? "",
              selfIntroduction: slackUserStatus.profile?.status_text ?? "",
              role:
                slackUserStatus.profile?.status_emoji === CROWN_EMOJI
                  ? "ADMIN"
                  : isDeveloper
                  ? "DEVELOPER"
                  : "USER",
              photoUrl: slackUserStatus.profile?.image_72 ?? "",
            },
          });

        // 初回ではない場合は、ユーザー情報を更新
        return await ctx.prisma.user.update({
          where: { id: ctx.userContext.user.id },
          data: {
            displayName: slackUserStatus.profile?.display_name ?? "",
            photoUrl: slackUserStatus.profile?.image_72 ?? "",
            signInCount: ctx.userContext.user.signInCount + 1,
          },
        });
      },
    });

    t.field("updateMyUserInfo", {
      type: userObject,
      args: { input: nonNull(arg({ type: updateMyUserInfoInput })) },
      resolve: async (_root, args, ctx, _info) => {
        if (!ctx.userContext.isAuthenticated || !ctx.userContext.user) throw Error(unauthorized);
        return await ctx.prisma.user.update({
          where: { id: ctx.userContext.user.id },
          data: {
            displayName: args.input.displayName ?? ctx.userContext.user.displayName,
            selfIntroduction: args.input.selfIntroduction ?? ctx.userContext.user.selfIntroduction,
          },
        });
      },
    });
  },
});
