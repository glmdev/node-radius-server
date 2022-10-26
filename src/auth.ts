import NodeCache from 'node-cache';
import { Cache, ExpirationStrategy, MemoryStorage } from '@hokify/node-ts-cache';
import { IAuthentication } from './interfaces/Authentication.js';
import { IContextLogger, ILogger } from './interfaces/Logger.js';
import { IPacket } from './interfaces/PacketHandler';

const cacheStrategy = new ExpirationStrategy(new MemoryStorage());
/**
 * this is just a simple abstraction to provide
 * an application layer for caching credentials
 */
export class Authentication implements IAuthentication {
	private cache = new NodeCache();

	private logger: IContextLogger;

	constructor(private authenticator: IAuthentication, logger: ILogger) {
		this.logger = logger.context('Authentication');
	}

	@Cache(cacheStrategy, { ttl: 60000 })
	async authenticate(username: string, password: string, packet?: IPacket): Promise<boolean> {
		const cacheKey = `usr:${username}|pwd:${password}`;
		const fromCache = this.cache.get(cacheKey) as undefined | boolean;
		if (fromCache !== undefined) {
			this.logger.log(`Cached Auth Result for user ${username}`, fromCache ? 'SUCCESS' : 'Failure');
			return fromCache;
		}

		const authResult = await this.authenticator.authenticate(username, password, packet);
		this.logger.log(`Auth Result for user ${username}`, authResult ? 'SUCCESS' : 'Failure');
		this.cache.set(cacheKey, !!authResult, authResult ? 86400 : 60); // cache for one day on success, otherwise just for 60 seconds

		return authResult;
	}
}
