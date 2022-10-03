/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IRemoteTunnelAccount, IRemoteTunnelService } from 'vs/platform/remoteTunnel/common/remoteTunnel';
import { Emitter } from 'vs/base/common/event';
import { IStorageService, IStorageValueChangeEvent, StorageScope, StorageTarget } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { Disposable } from 'vs/base/common/lifecycle';


type RemoteTunnelEnablementClassification = {
	owner: 'aeschli';
	comment: 'Reporting when Machine Sharing is turned on or off';
	enabled?: { classification: 'SystemMetaData'; purpose: 'FeatureInsight'; isMeasurement: true; comment: 'Flag indicating if machine sharing is enabled or not' };
};


const enablementKey = 'remoteTunnel.enable';


export class RemoteTunnelService extends Disposable implements IRemoteTunnelService {

	declare readonly _serviceBrand: undefined;

	private readonly _onTokenFailedEmitter = new Emitter<boolean>();
	public readonly onTokenFailed = this._onTokenFailedEmitter.event;

	private readonly _onDidChangeAccountEmitter = new Emitter<IRemoteTunnelAccount | undefined>();
	public readonly onDidChangeAccount = this._onDidChangeAccountEmitter.event;

	private readonly _onDidChangeEnablementEmitter = new Emitter<boolean>();
	public readonly onDidChangeEnablement = this._onDidChangeEnablementEmitter.event;


	private _account: IRemoteTunnelAccount | undefined;

	constructor(
		@IStorageService private readonly storageService: IStorageService,
		@ITelemetryService private readonly telemetryService: ITelemetryService,
		@IEnvironmentService protected readonly environmentService: IEnvironmentService,
	) {
		super();
		this._register(storageService.onDidChangeValue(e => this.onDidStorageChange(e)));
	}


	get account(): IRemoteTunnelAccount | undefined {
		return this._account;
	}

	async updateAccount(account: IRemoteTunnelAccount | undefined): Promise<void> {
		if (account && this._account ? account.token !== this._account.token || account.authenticationProviderId !== this._account.authenticationProviderId : account !== this._account) {
			this._account = account;
			this._onDidChangeAccountEmitter.fire(account);
		}

	}
	isEnabled(): boolean {
		return this.storageService.getBoolean(enablementKey, StorageScope.APPLICATION, false);
	}
	async setEnablement(enabled: boolean): Promise<void> {
		this.telemetryService.publicLog2<{ enabled: boolean }, RemoteTunnelEnablementClassification>(enablementKey, { enabled });
		this.storageService.store(enablementKey, enabled, StorageScope.APPLICATION, StorageTarget.MACHINE);
	}

	private onDidStorageChange(storageChangeEvent: IStorageValueChangeEvent): void {
		if (storageChangeEvent.scope !== StorageScope.APPLICATION) {
			return;
		}

		if (enablementKey === storageChangeEvent.key) {
			this._onDidChangeEnablementEmitter.fire(this.isEnabled());
			return;
		}
	}

}
