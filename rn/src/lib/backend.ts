// Hand-maintained contract mirroring the deployed backend functions; update when they change.
import { makeFunctionReference } from 'convex/server';
import type { GenericId } from 'convex/values';

export type Id<TableName extends string> = GenericId<TableName>;

export type Poll = {
  _id: Id<'polls'>;
  _creationTime: number;
  question: string;
  options: string[];
  // Missing on polls created before sign-in existed.
  createdBy?: Id<'users'>;
  creatorName: string | null;
};

export type OptionResult = { option: string; count: number };

export const api = {
  polls: {
    list: makeFunctionReference<'query', Record<string, never>, Poll[]>('polls:list'),
    get: makeFunctionReference<'query', { id: Id<'polls'> }, Poll | null>('polls:get'),
    create: makeFunctionReference<
      'mutation',
      { question: string; options: string[] },
      Id<'polls'>
    >('polls:create'),
  },
  votes: {
    cast: makeFunctionReference<
      'mutation',
      { pollId: Id<'polls'>; option: string },
      Id<'votes'>
    >('votes:cast'),
    myVote: makeFunctionReference<'query', { pollId: Id<'polls'> }, string | null>(
      'votes:myVote',
    ),
    results: makeFunctionReference<'query', { pollId: Id<'polls'> }, OptionResult[] | null>(
      'votes:results',
    ),
  },
  users: {
    setName: makeFunctionReference<'mutation', { name: string }, string>('users:setName'),
    me: makeFunctionReference<'query', Record<string, never>, { name: string | null } | null>(
      'users:me',
    ),
  },
};
