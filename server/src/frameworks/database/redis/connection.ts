import configKeys from '../../../config';
import { createClient } from 'redis'

const connection = () => {

  const createRedisClient = () => {

    console.log("Using mock Redis client for local testing");

    const mockClient = {
      setEx: async () => {},
      del: async () => {},
      set: async () => {},
      get: async () => null,
      connect: async () => {},
      on: () => {}
    };

    return mockClient as any;

  };

  return {
    createRedisClient
  };
}

export default connection