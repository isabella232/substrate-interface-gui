/*
 * Polkascan Substrate Interface GUI
 *
 * Copyright 2018-2020 openAware BV (NL).
 * This file is part of Polkascan.
 *
 * Polkascan is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Polkascan is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Polkascan. If not, see <http://www.gnu.org/licenses/>.
 *
 * rpc-calls.component.ts
 *
 */

import { Component, OnInit } from '@angular/core';
import {SubstrateApiService} from '../../services/substrate-api.service';
import { RpcRequestParam } from 'src/app/classes/param.class';

@Component({
  selector: 'app-rpc-calls',
  templateUrl: './rpc-calls.component.html',
  styleUrls: ['./rpc-calls.component.scss']
})
export class RpcCallsComponent implements OnInit {

  public rpcMethods = ['Loading..'];
  public selectedRpcMethod: string;
  public result: string;
  public rpcParams: RpcRequestParam[] = [];

  constructor(private substrateApiService: SubstrateApiService) { }

  ngOnInit() {
    this.substrateApiService.getRpcMethods().subscribe(data => {
      this.rpcMethods = data.result.methods;
      this.selectedRpcMethod = this.rpcMethods[0];
      this.updateParamFields();
    });
  }

  updateParamValue(event, param) {
    param.value = JSON.parse(event.target.value);
  }

  updateParamFields() {
     this.rpcParams = [];

     switch (this.selectedRpcMethod) {
      case 'runtime_addCustomType':
        this.rpcParams.push({type: 'string', name: 'Type name', value: 'MyCustomType'});
        this.rpcParams.push({type: 'dict', name: 'Type definition', value: {
          type: 'struct',
          type_mapping: [
             ['index', 'u32'],
             ['members', 'Vec<AccountId>']
              ]
        }});
        break;
      case 'runtime_composeCall':
        this.rpcParams.push({type: 'string', name: 'Call Module', value: 'Balances'});
        this.rpcParams.push({type: 'string', name: 'Call Function', value: 'transfer'});
        this.rpcParams.push({type: 'array', name: 'Parameters', value: {
                          dest: 'EaG2CRhJWPb7qmdcJvy3LiWdh26Jreu9Dx6R1rXxPmYXoDk',
                          value: 4000000000
                        }
        });
        break;
      case 'runtime_decodeScale':
        this.rpcParams.push({type: 'string', name: 'Type String', value: 'BlockNumber'});
        this.rpcParams.push({type: 'string', name: 'SCALE hex-bytes', value: '0x020a0000'});
        break;
      case 'runtime_encodeScale':
        this.rpcParams.push({type: 'string', name: 'Type String', value: 'Timepoint'});
        this.rpcParams.push({type: 'dict', name: 'Value', value: {height: 345678, index: 5}});
        break;
      case 'runtime_getState':
        this.rpcParams.push({type: 'string', name: 'Module', value: 'Balances'});
        this.rpcParams.push({type: 'string', name: 'Storage function', value: 'FreeBalance'});
        this.rpcParams.push({type: 'array', name: 'Parameters', value: ['EaG2CRhJWPb7qmdcJvy3LiWdh26Jreu9Dx6R1rXxPmYXoDk']});
        this.rpcParams.push({type: 'BlockHashOrId', name: 'Block hash or ID', value: null});
        break;
      case 'runtime_getBlock':
      case 'runtime_getMetadata':
      case 'runtime_getMetadataModules':
      case 'runtime_getMetadataCallFunctions':
      case 'runtime_getMetadataEvents':
      case 'runtime_getMetadataConstants':
      case 'runtime_getMetadataStorageFunctions':
      case 'runtime_getMetadataErrors':
      case 'runtime_getTypeRegistry':
        this.rpcParams.push({type: 'BlockHashOrId', name: 'Block hash or ID', value: null});
        break;
      case 'runtime_getMetadataCallFunction':
      case 'runtime_getMetadataEvent':
      case 'runtime_getMetadataConstant':
      case 'runtime_getMetadataStorageFunction':
      case 'runtime_getMetadataError':
        this.rpcParams.push({type: 'string', name: 'Module Name', value: null});
        this.rpcParams.push({type: 'string', name: 'Item Name', value: null});
        this.rpcParams.push({type: 'BlockHashOrId', name: 'Block hash or ID', value: null});
        break;
      case 'runtime_getType':
        this.rpcParams.push({type: 'string', name: 'Type string', value: 'IdentityInfo'});
        this.rpcParams.push({type: 'BlockHashOrId', name: 'Block hash or ID', value: 300000});
        break;
      case 'runtime_setCustomTypes':
        this.rpcParams.push({type: 'dict', name: 'Custom Types', value: {MyCustomType2: 'u32'}});
        break;
      case 'runtime_removeCustomType':
        this.rpcParams.push({type: 'string', name: 'Custom Type string', value: 'MyCustomType'});
        break;
    }
  }

  isNewRpcMethod(value) {
    return !value || value.startsWith('runtime_');
  }

  selectRpcMethod(e) {
    this.selectedRpcMethod = e.target.value;

    this.result = null;
    this.updateParamFields();
  }

  addParameter() {
    this.rpcParams.push({type: 'string', name: 'Parameter ' + (this.rpcParams.length + 1), value: null});
  }

  submitCall() {

    const params = [];

    for (const param of this.rpcParams) {
      console.log(param.name, param.value);
      if (param.type === 'BlockHashOrId') {
         if (!param.value) {
           params.push(null);
         } else {
           params.push(+param.value);
         }
       } else {

         if (!param.value) {
           params.push(null);
         } else {
           params.push(param.value);
         }
       }
    }

    this.substrateApiService.executeRPCRequest(this.selectedRpcMethod, params).subscribe(data => {

      this.result = data.result;
      if (data.error) {
        alert('RPC Error: ' + data.error.message);
      }
    });
  }

}
