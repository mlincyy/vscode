/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { AccountStatus } from 'vs/workbench/services/remoteTunnel/common/remoteTunnel';

export class RemoteTunnelWorkbenchService extends Disposable implements IRemoteTunnelWorkbenchService {


	private _accountStatus: AccountStatus = AccountStatus.Uninitialized;
	get accountStatus(): AccountStatus { return this._accountStatus; }

	private readonly _onDidChangeAccountStatus = this._register(new Emitter<AccountStatus>());
	readonly onDidChangeAccountStatus = this._onDidChangeAccountStatus.event;

	constructor(
		@IAuthenticationService private readonly authenticationService: IAuthenticationService,
		@IRemoteTunnelEnablementService private readonly remoteTunnelEnablementService: IRemoteTunnelEnablementService
	) {
		super();

	}

	private async updateAccountStatus() {
		const s = await this.authenticationService.getSessions('github', ['read:user', 'read:org'], true);
		this._accountStatus = s.length === 0 ? AccountStatus.Unavailable : AccountStatus.Available;
		this._onDidChangeAccountStatus.fire(this._accountStatus);
	}

	public setSharing(state: boolean) {

	}



	private async isAuthenticated(): Promise<boolean> {
		const s = await this.authenticationService.getSessions('github', ['read:user', 'read:org'], true);
		return s.length > 0;
	}

	private async getAuthenticationToken() {
		const s = await this.authenticationService.getSessions('github', ['read:user', 'read:org'],);
		return s.accessToken;
	}

}
