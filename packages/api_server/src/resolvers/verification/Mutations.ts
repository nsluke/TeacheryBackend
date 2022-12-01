import { MutationResolvers } from '@generated/graphql/verification_service/resolvers';
import {
  issuePhoneVerification,
  checkOneTimePassword,
} from '@/util/phoneVerification';

export const resolvers: MutationResolvers = {
  async issuePhoneVerification(
    _0,
    { request },
    { globalContext, dataSources }
  ) {
    await issuePhoneVerification({
      globalContext,
      phoneNumber: request.phoneNumber,
    });

    const user = await dataSources.User.getByPhoneNumber(request.phoneNumber);

    return {
      knownPhoneNumber: !!user,
    };
  },

  async verifyPhoneNumber(_0, { request }, { globalContext, dataSources }) {
    const isValid = await checkOneTimePassword({
      globalContext,
      phoneNumber: request.phoneNumber,
      oneTimePassword: request.oneTimePassword,
    });

    if (!isValid) {
      throw new Error('Unauthorized');
    }

    const verificationToken =
      await dataSources.AuthToken.createPhoneVerificationToken(
        request.phoneNumber
      );

    return { verificationToken: verificationToken.id };
  },
};