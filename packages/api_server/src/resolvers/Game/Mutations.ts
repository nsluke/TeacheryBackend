import { IdentityType } from '@prisma/client';

import {
  MutationResolvers,
  GameEventType,
} from '@generated/graphql/game_service/resolvers';

import { broadcastGameEvent } from '@/resolvers/game/Subscriptions';

export const resolvers: MutationResolvers = {
  async createGame(_0, _1, { dataSources }) {
    const game = await dataSources.Game.createGame();
    const authToken = await dataSources.AuthToken.createGameHostAuthToken(
      game.id
    );
    return { game, authToken: authToken.id };
  },

  async joinGame(_0, { request }, { actor, dataSources }) {
    if (!actor) {
      throw new Error('Unauthorized');
    }

    const alreadyJoined = await dataSources.Game.addPlayer({
      gameId: request.gameId,
      userId: actor.id,
    });

    if (!alreadyJoined) {
      broadcastGameEvent(request.gameId, {
        type: GameEventType.PlayerJoin,
        timestamp: new Date(),
        details: {
          __typename: 'PlayerJoinEvent',
          user: actor,
        },
      });
    }
  },

  async startGame(_0, { request }, { dataSources }) {
    const game = await dataSources.Game.startGame({
      gameId: request.gameId,
      identityDataSource: dataSources.MTGTreachery,
    });

    broadcastGameEvent(request.gameId, {
      type: GameEventType.GameStart,
      timestamp: new Date(),
      details: {
        __typename: 'GameStartEvent',
        game,
      },
    });

    return { game };
  },

  async unveil(_0, { game }, { actor, dataSources }) {
    if (!actor) {
      throw new Error('Unauthorized');
    }

    const player = await dataSources.Game.unveil({
      gameId: game,
      userId: actor.id,
    });

    if (!player) {
      throw new Error(`User ${actor.id} is not a player in game ${game}.`);
    }

    broadcastGameEvent(game, {
      type: GameEventType.PlayerUnveil,
      timestamp: new Date(),
      details: {
        __typename: 'PlayerUnveilEvent',
        player,
      },
    });
  },

  async concede(_0, { game }, { actor, dataSources }) {
    if (!actor) {
      throw new Error('Unauthorized');
    }

    const player = await dataSources.Game.concede({
      gameId: game,
      userId: actor.id,
    });

    if (!player) {
      throw new Error(`User ${actor.id} is not a player in game ${game}.`);
    }

    broadcastGameEvent(game, {
      type: GameEventType.PlayerConcede,
      timestamp: new Date(),
      details: {
        __typename: 'PlayerConcedeEvent',
        player,
      },
    });
  },
};
