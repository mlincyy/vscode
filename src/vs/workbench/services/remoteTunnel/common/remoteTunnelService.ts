/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IStorageService, IStorageValueChangeEvent, StorageScope, StorageTarget } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IRemoteTunnelEnablementService } from 'vs/workbench/services/remoteTunnel/common/remoteTunnel';

type RemoteTunnelEnablementClassification = {
	owner: 'aeschli';
	comment: 'Reporting when Machine Sharing is turned on or off';
	enabled?: { classification: 'SystemMetaData'; purpose: 'FeatureInsight'; isMeasurement: true; comment: 'Flag indicating if machine sharing is enabled or not' };
};

const enablementKey = 'remoteTunnel.enable';

export class RenoteTunnelEnablementService extends Disposable implements IRemoteTunnelEnablementService {

	_serviceBrand: any;

	private _onDidChangeEnablement = new Emitter<boolean>();
	readonly onDidChangeEnablement: Event<boolean> = this._onDidChangeEnablement.event;

	constructor(
		@IStorageService private readonly storageService: IStorageService,
		@ITelemetryService private readonly telemetryService: ITelemetryService,
		@IEnvironmentService protected readonly environmentService: IEnvironmentService,
	) {
		super();
		this._register(storageService.onDidChangeValue(e => this.onDidStorageChange(e)));
	}

	isEnabled(): boolean {
		switch (this.environmentService.sync) {
			case 'on':
				return true;
			case 'off':
				return false;
		}
		return this.storageService.getBoolean(enablementKey, StorageScope.APPLICATION, false);
	}

	setEnablement(enabled: boolean): void {
		this.telemetryService.publicLog2<{ enabled: boolean }, RemoteTunnelEnablementClassification>(enablementKey, { enabled });
		this.storageService.store(enablementKey, enabled, StorageScope.APPLICATION, StorageTarget.MACHINE);
	}

	private onDidStorageChange(storageChangeEvent: IStorageValueChangeEvent): void {
		if (storageChangeEvent.scope !== StorageScope.APPLICATION) {
			return;
		}

		if (enablementKey === storageChangeEvent.key) {
			this._onDidChangeEnablement.fire(this.isEnabled());
			return;
		}
	}
}
