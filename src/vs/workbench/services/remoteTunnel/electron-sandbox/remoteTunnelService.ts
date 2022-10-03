/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import { registerSharedProcessRemoteService } from 'vs/platform/ipc/electron-sandbox/services';
import { UserDataSyncChannelClient } from 'vs/platform/userDataSync/common/userDataSyncServiceIpc';
import { IRemoteTunnelEnablementService } from 'vs/workbench/services/remoteTunnel/common/remoteTunnel';

registerSharedProcessRemoteService(IRemoteTunnelEnablementService, 'remoteTunnelEnablement', { channelClientCtor: UserDataSyncChannelClient });
