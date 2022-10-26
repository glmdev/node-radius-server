import { IPacket } from './PacketHandler';

export interface IAuthentication {
	authenticate(username: string, password: string, packet?: IPacket): Promise<boolean>;
}
