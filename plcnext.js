/**
 * @file A node package for use with PLCnext Technology controllers.
 * @module plcnext
 * @version 0.1.3
 * @author Martin Boers 
 * @license
 * Copyright (c) 2018 Martin Boers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
*/

'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const xml2js = require('xml2js');

/**
 * Extracts elements and attributes from a TIC element list.
 * See separate documentation for json schemas. 
 * @param {Object} elementList - an element list in TIC format.
 * @returns {Object[]} a list of elements and their attributes.
 */
var getElements = function (elementList) {
  var elements = [];

  // Check that the element list contains at least one element.
  if ('E' in elementList) {
    elementList.E.forEach(element => {
      var attributes = [];

      // Check if the element has an attribute list and, if so,
      // that the list contains at least one attribute.
      // If so, record the attribute names & values.
      if ('AL' in element && 'A' in element.AL[0]) {
        element.AL[0].A.forEach(attribute => {
          attributes.push({
            name: attribute.$.n,
            value: attribute.V[0]
          });
        });
      }

      // Record the element name, any child element list,
      // and the attribute list.
      elements.push({
        name: element.$.n,
        elementList: (
          'EL' in element
            ? element.EL[0]
            : []
        ),
        attributes: attributes
      });
    });
  }
  return elements;
};

/**
 * Gets a complete list of global objects available on the
 * PLCnext Technology platform.
 * See separate documentation for json schemas. 
 * @returns {Object[]} a list of global objects.
 */
exports.getGlobalObjects = function () {
  var globalObjects = [
    {
      key: 'Arp.Io.FbIo.AxlC/',
      name: 'AxlC',
      leftArray: [],
      rightArray: [
        { portId: 'AXIO_DIAG_STATUS_REG_HI',
          text: 'AXIO_DIAG_STATUS_REG_HI',
          type: 'uint16' },
        { portId: 'AXIO_DIAG_STATUS_REG_LOW',
          text: 'AXIO_DIAG_STATUS_REG_LOW',
          type: 'uint16' },
        { portId: 'AXIO_DIAG_PARAM_REG_HI',
          text: 'AXIO_DIAG_PARAM_REG_HI',
          type: 'uint16' },
        { portId: 'AXIO_DIAG_PARAM_REG_LOW',
          text: 'AXIO_DIAG_PARAM_REG_LOW',
          type: 'uint16' },
        { portId: 'AXIO_DIAG_PARAM_2_REG_HI',
          text: 'AXIO_DIAG_PARAM_2_REG_HI',
          type: 'uint16' },
        { portId: 'AXIO_DIAG_PARAM_2_REG_LOW',
          text: 'AXIO_DIAG_PARAM_2_REG_LOW',
          type: 'uint16' },
        { portId: 'AXIO_DIAG_STATUS_REG_PF',
          text: 'AXIO_DIAG_STATUS_REG_PF',
          type: 'uint16' },
        { portId: 'AXIO_DIAG_STATUS_REG_BUS',
          text: 'AXIO_DIAG_STATUS_REG_BUS',
          type: 'uint16' },
        { portId: 'AXIO_DIAG_STATUS_REG_RUN',
          text: 'AXIO_DIAG_STATUS_REG_RUN',
          type: 'uint16' },
        { portId: 'AXIO_DIAG_STATUS_REG_ACT',
          text: 'AXIO_DIAG_STATUS_REG_ACT',
          type: 'uint16' },
        { portId: 'AXIO_DIAG_STATUS_REG_RDY',
          text: 'AXIO_DIAG_STATUS_REG_RDY',
          type: 'uint16' },
        { portId: 'AXIO_DIAG_STATUS_REG_SYSFAIL',
          text: 'AXIO_DIAG_STATUS_REG_SYSFAIL',
          type: 'uint16' },
        { portId: 'AXIO_DIAG_STATUS_REG_PW',
          text: 'AXIO_DIAG_STATUS_REG_PW',
          type: 'uint16' }
      ]
    },
    {
      key: 'Arp.Io.FbIo.PnC/',
      name: 'PnC',
      leftArray: [
        {
          portId: 'PNIO_FORCE_FAILSAFE',
          text: 'PNIO_FORCE_FAILSAFE',
          type: 'bit'
        }
      ],
      rightArray: [
        {
          portId: 'PNIO_SYSTEM_BF',
          text: 'PNIO_SYSTEM_BF',
          type: 'bit'
        },
        {
          portId: 'PNIO_SYSTEM_SF',
          text: 'PNIO_SYSTEM_SF',
          type: 'bit'
        },
        {
          portId: 'PNIO_MAINTENANCE_DEMANDED',
          text: 'PNIO_MAINTENANCE_DEMANDED',
          type: 'bit'
        },
        {
          portId: 'PNIO_MAINTENANCE_REQUIRED',
          text: 'PNIO_MAINTENANCE_REQUIRED',
          type: 'bit'
        },
        {
          portId: 'PNIO_CONFIG_STATUS',
          text: 'PNIO_CONFIG_STATUS',
          type: 'bit'
        },
        {
          portId: 'PNIO_CONFIG_STATUS_ACTIVE',
          text: 'PNIO_CONFIG_STATUS_ACTIVE',
          type: 'bit'
        },
        {
          portId: 'PNIO_CONFIG_STATUS_READY',
          text: 'PNIO_CONFIG_STATUS_READY',
          type: 'bit'
        },
        {
          portId: 'PNIO_CONFIG_STATUS_CFG_FAULT',
          text: 'PNIO_CONFIG_STATUS_CFG_FAULT',
          type: 'bit'
        }
      ]
    },
    {
      key: 'Arp.Io.FbIo.PnD/',
      name: 'PnD',
      leftArray: [
        {
          portId: 'PND_S1_OUTPUTS',
          text: 'PND_S1_OUTPUTS',
          type: 'uint16'
        }
      ],
      rightArray: [
        {
          portId: 'PND_S1_PLC_RUN',
          text: 'PND_S1_PLC_RUN',
          type: 'bit'
        },
        {
          portId: 'PND_S1_VALID_DATA_CYCLE',
          text: 'PND_S1_VALID_DATA_CYCLE',
          type: 'bit'
        },
        {
          portId: 'PND_S1_OUTPUT_STATUS_GOOD',
          text: 'PND_S1_OUTPUT_STATUS_GOOD',
          type: 'bit'
        },
        {
          portId: 'PND_S1_INPUT_STATUS_GOOD',
          text: 'PND_S1_INPUT_STATUS_GOOD',
          type: 'bit'
        },
        {
          portId: 'PND_S1_DATA_LENGTH',
          text: 'PND_S1_DATA_LENGTH',
          type: 'uint16'
        },
        {
          portId: 'PND_S1_INPUTS',
          text: 'PND_S1_INPUTS',
          type: 'uint16'
        }
      ]
    },
    {
      key: 'Arp.Plc.Esm/',
      name: 'Esm',
      leftArray: [],
      rightArray: [
        {
          portId: 'ESM_COUNT',
          text: 'ESM_COUNT',
          type: 'uint16'
        },
        {
          portId: 'ESM_1_TASKS_USED',
          text: 'ESM_1_TASKS_USED',
          type: 'uint16'
        },
        {
          portId: 'ESM_1_TASK_1',
          text: 'ESM_1_TASK_1',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_2',
          text: 'ESM_1_TASK_2',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_3',
          text: 'ESM_1_TASK_3',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_4',
          text: 'ESM_1_TASK_4',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_5',
          text: 'ESM_1_TASK_5',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_6',
          text: 'ESM_1_TASK_6',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_7',
          text: 'ESM_1_TASK_7',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_8',
          text: 'ESM_1_TASK_8',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_9',
          text: 'ESM_1_TASK_9',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_10',
          text: 'ESM_1_TASK_10',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_11',
          text: 'ESM_1_TASK_11',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_12',
          text: 'ESM_1_TASK_12',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_13',
          text: 'ESM_1_TASK_13',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_14',
          text: 'ESM_1_TASK_14',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_15',
          text: 'ESM_1_TASK_15',
          type: 'bit' },
        {
          portId: 'ESM_1_TASK_16',
          text: 'ESM_1_TASK_16',
          type: 'bit' },
        {
          portId: 'ESM_2_TASKS_USED',
          text: 'ESM_2_TASKS_USED',
          type: 'uint16' },
        {
          portId: 'ESM_2_TASK_1',
          text: 'ESM_2_TASK_1',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_2',
          text: 'ESM_2_TASK_2',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_3',
          text: 'ESM_2_TASK_3',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_4',
          text: 'ESM_2_TASK_4',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_5',
          text: 'ESM_2_TASK_5',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_6',
          text: 'ESM_2_TASK_6',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_7',
          text: 'ESM_2_TASK_7',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_8',
          text: 'ESM_2_TASK_8',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_9',
          text: 'ESM_2_TASK_9',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_10',
          text: 'ESM_2_TASK_10',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_11',
          text: 'ESM_2_TASK_11',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_12',
          text: 'ESM_2_TASK_12',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_13',
          text: 'ESM_2_TASK_13',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_14',
          text: 'ESM_2_TASK_14',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_15',
          text: 'ESM_2_TASK_15',
          type: 'bit' },
        {
          portId: 'ESM_2_TASK_16',
          text: 'ESM_2_TASK_16',
          type: 'bit' }
      ]
    },
    {
      key: 'Arp.Plc.Eclr/',
      name: 'Eclr',
      leftArray: [
        {
          portId: 'AXIO_DIAG_STATUS_REG_HI',
          text: 'AXIO_DIAG_STATUS_REG_HI',
          type: 'uint16'
        },
        {
          portId: 'AXIO_DIAG_STATUS_REG_LOW',
          text: 'AXIO_DIAG_STATUS_REG_LOW',
          type: 'uint16'
        },
        {
          portId: 'AXIO_DIAG_PARAM_REG_HI',
          text: 'AXIO_DIAG_PARAM_REG_HI',
          type: 'uint16'
        },
        {
          portId: 'AXIO_DIAG_PARAM_REG_LOW',
          text: 'AXIO_DIAG_PARAM_REG_LOW',
          type: 'uint16'
        },
        {
          portId: 'AXIO_DIAG_PARAM_2_REG_HI',
          text: 'AXIO_DIAG_PARAM_2_REG_HI',
          type: 'uint16'
        },
        {
          portId: 'AXIO_DIAG_PARAM_2_REG_LOW',
          text: 'AXIO_DIAG_PARAM_2_REG_LOW',
          type: 'uint16'
        },
        {
          portId: 'AXIO_DIAG_STATUS_REG_PF',
          text: 'AXIO_DIAG_STATUS_REG_PF',
          type: 'uint16'
        },
        {
          portId: 'AXIO_DIAG_STATUS_REG_BUS',
          text: 'AXIO_DIAG_STATUS_REG_BUS',
          type: 'uint16'
        },
        {
          portId: 'AXIO_DIAG_STATUS_REG_RUN',
          text: 'AXIO_DIAG_STATUS_REG_RUN',
          type: 'uint16'
        },
        {
          portId: 'AXIO_DIAG_STATUS_REG_ACT',
          text: 'AXIO_DIAG_STATUS_REG_ACT',
          type: 'uint16'
        },
        {
          portId: 'AXIO_DIAG_STATUS_REG_RDY',
          text: 'AXIO_DIAG_STATUS_REG_RDY',
          type: 'uint16'
        },
        {
          portId: 'AXIO_DIAG_STATUS_REG_SYSFAIL',
          text: 'AXIO_DIAG_STATUS_REG_SYSFAIL',
          type: 'uint16'
        },
        {
          portId: 'AXIO_DIAG_STATUS_REG_PW',
          text: 'AXIO_DIAG_STATUS_REG_PW',
          type: 'uint16'
        },

        {
          portId: 'PNIO_SYSTEM_BF',
          text: 'PNIO_SYSTEM_BF',
          type: 'bit'
        },
        {
          portId: 'PNIO_SYSTEM_SF',
          text: 'PNIO_SYSTEM_SF',
          type: 'bit'
        },
        {
          portId: 'PNIO_MAINTENANCE_DEMANDED',
          text: 'PNIO_MAINTENANCE_DEMANDED',
          type: 'bit'
        },
        {
          portId: 'PNIO_MAINTENANCE_REQUIRED',
          text: 'PNIO_MAINTENANCE_REQUIRED',
          type: 'bit'
        },
        {
          portId: 'PNIO_CONFIG_STATUS',
          text: 'PNIO_CONFIG_STATUS',
          type: 'bit'
        },
        {
          portId: 'PNIO_CONFIG_STATUS_ACTIVE',
          text: 'PNIO_CONFIG_STATUS_ACTIVE',
          type: 'bit'
        },
        {
          portId: 'PNIO_CONFIG_STATUS_READY',
          text: 'PNIO_CONFIG_STATUS_READY',
          type: 'bit'
        },
        {
          portId: 'PNIO_CONFIG_STATUS_CFG_FAULT',
          text: 'PNIO_CONFIG_STATUS_CFG_FAULT',
          type: 'bit'
        },

        {
          portId: 'PND_S1_PLC_RUN',
          text: 'PND_S1_PLC_RUN',
          type: 'bit'
        },
        {
          portId: 'PND_S1_VALID_DATA_CYCLE',
          text: 'PND_S1_VALID_DATA_CYCLE',
          type: 'bit'
        },
        {
          portId: 'PND_S1_OUTPUT_STATUS_GOOD',
          text: 'PND_S1_OUTPUT_STATUS_GOOD',
          type: 'bit'
        },
        {
          portId: 'PND_S1_INPUT_STATUS_GOOD',
          text: 'PND_S1_INPUT_STATUS_GOOD',
          type: 'bit'
        },
        {
          portId: 'PND_S1_DATA_LENGTH',
          text: 'PND_S1_DATA_LENGTH',
          type: 'uint16'
        },
        {
          portId: 'PND_S1_INPUTS',
          text: 'PND_S1_INPUTS',
          type: 'uint16'
        },

        {
          portId: 'ESM_COUNT',
          text: 'ESM_COUNT',
          type: 'uint16'
        },
        {
          portId: 'ESM_1_TASKS_USED',
          text: 'ESM_1_TASKS_USED',
          type: 'uint16'
        },
        {
          portId: 'ESM_1_TASK_1',
          text: 'ESM_1_TASK_1',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_2',
          text: 'ESM_1_TASK_2',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_3',
          text: 'ESM_1_TASK_3',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_4',
          text: 'ESM_1_TASK_4',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_5',
          text: 'ESM_1_TASK_5',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_6',
          text: 'ESM_1_TASK_6',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_7',
          text: 'ESM_1_TASK_7',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_8',
          text: 'ESM_1_TASK_8',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_9',
          text: 'ESM_1_TASK_9',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_10',
          text: 'ESM_1_TASK_10',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_11',
          text: 'ESM_1_TASK_11',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_12',
          text: 'ESM_1_TASK_12',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_13',
          text: 'ESM_1_TASK_13',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_14',
          text: 'ESM_1_TASK_14',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_15',
          text: 'ESM_1_TASK_15',
          type: 'bit'
        },
        {
          portId: 'ESM_1_TASK_16',
          text: 'ESM_1_TASK_16',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASKS_USED',
          text: 'ESM_2_TASKS_USED',
          type: 'uint16'
        },
        {
          portId: 'ESM_2_TASK_1',
          text: 'ESM_2_TASK_1',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_2',
          text: 'ESM_2_TASK_2',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_3',
          text: 'ESM_2_TASK_3',
          type: 'bit'
         },
        {
          portId: 'ESM_2_TASK_4',
          text: 'ESM_2_TASK_4',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_5',
          text: 'ESM_2_TASK_5',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_6',
          text: 'ESM_2_TASK_6',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_7',
          text: 'ESM_2_TASK_7',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_8',
          text: 'ESM_2_TASK_8',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_9',
          text: 'ESM_2_TASK_9',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_10',
          text: 'ESM_2_TASK_10',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_11',
          text: 'ESM_2_TASK_11',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_12',
          text: 'ESM_2_TASK_12',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_13',
          text: 'ESM_2_TASK_13',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_14',
          text: 'ESM_2_TASK_14',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_15',
          text: 'ESM_2_TASK_15',
          type: 'bit'
        },
        {
          portId: 'ESM_2_TASK_16',
          text: 'ESM_2_TASK_16',
          type: 'bit'
        }
      ],
      rightArray: [
        {
          portId: 'PNIO_FORCE_FAILSAFE',
          text: 'PNIO_FORCE_FAILSAFE',
          type: 'bit'
        },
        {
          portId: 'PND_S1_OUTPUTS',
          text: 'PND_S1_OUTPUTS',
          type: 'uint16'
        }
      ]
    },
  ];

  return globalObjects;
};

/**
 * Gets a list of input/ouput modules available for a
 * PLCnext Technology hardware configuration (TIC).
 * See separate documentation for json schemas. 
 * @param {string} ticFileName - the name of a TIC file.
 * @returns {Object[]} a list of Input/Output objects defined in the TIC file.
 */
exports.getIoModules = function (ticFileName) {

  // This function defines two internal nested functions:
  // - getFrames and getPorts.
  // These functions are called recusrsively to search the
  // TIC element tree for IO:Frame elements, and then IO:Port elements.

  var ioModules = [];

  //TODO: Include checks on the existence of all files.

  // Read IO configuration data from the TIC file.
  var ioData = fs.readFileSync(ticFileName);

  // Parse the XML IO data.
  var ioParser = new xml2js.Parser();
  ioParser.parseString(ioData, function (err, result) {

    // getFrames: a function that walks the element tree,
    // looking for IO:Frame elements.
    function getFrames(elementList) {
      var FrameId = '';  // Identifies the frame type as IN or OUT.

      // getPorts: a function that walks the element tree,
      // looking for IO:Port elements.
      function getPorts(elementList) {
        var elements = getElements(elementList);
        elements.forEach(element => {
          if (element.name === 'IO:Port') {
            var NodeId, Name, DataType;
            element.attributes.forEach(attribute => {
              switch (attribute.name) {
                case 'NodeId':
                  NodeId = attribute.value;
                  break;
                case 'Name':
                  Name = attribute.value;
                  break;
                case 'DataType':
                  DataType = attribute.value;
                  break;
                default:
                  break;
              }
            });

            // Create a new Node with this NodeId, if it doesn't exist.
            var thisNode;
            var ioModuleKey = 'Arp.Io.FbIo.AxlC/' + NodeId;
            var ioModuleNode = ioModules.filter(
              node => node.key === ioModuleKey
            );
            if (ioModuleNode.length > 0) thisNode = ioModuleNode[0];
            else {
              thisNode = {
                key: ioModuleKey,
                name: 'AxlC/' + NodeId, leftArray: [], rightArray: []
              };
              ioModules.push(thisNode);
            }

            // Add the port to the Node - either an Input or Output port,
            // depending on the FrameId.
            switch (FrameId) {
              case '1:IN':
                thisNode.rightArray.push({ portId: Name, text: Name, type: DataType });
                break;
              case '1:OUT':
                thisNode.leftArray.push({ portId: Name, text: Name, type: DataType });
                break;
              default:
                break;
            }
          }

          // Keep walking the tree looking for IO Ports.
          getPorts(element.elementList);
        });
      };

      // Get all the Elements in the Element List.
      var elements = getElements(elementList);

      // Look for IO Frame elements in the list.
      elements.forEach(element => {
        if (element.name === 'IO:Frame') {

          // For each IO Frame element, get the FrameId.
          element.attributes.forEach(attribute => {
            if (attribute.name === 'FrameId') FrameId = attribute.value;
          });

          // For each IO Frame element, get all the IO Ports.
          getPorts(element.elementList);
        }

        // Keep walking the tree looking for IO Frames.
        getFrames(element.elementList);
      });
    };

    // Now call the function!
    getFrames(result.TIC);
  });

  return ioModules;
};

/**
 * Gets a list of program types available for a
 * PLCnext Technology configuration.
 * See separate documentation for json schemas. 
 * @param {string} metaConfigFileName - the name of a meta configuration file.
 * @returns {Object[]} a list of defined programs.
 */
exports.getPrograms = function (metaConfigFilename) {

  // Construct information about all the programs in the specified project.
  var libMetaExtension = '.libmeta';

  var programs = [];

  //TODO: Include checks on the existence of all files.
  //TODO: Fully qualfiy each program (Library, Component etc.).

  // Read meta configuration data.
  var metaConfigData = fs.readFileSync(metaConfigFilename);

  // Parse the XML meta configuration data.
  var metaConfigParser = new xml2js.Parser();
  metaConfigParser.parseString(
    metaConfigData,
    function (err, result) {

      // Iterate through the list of paths where library metadata can be found.
      result.MetaConfigurationDocument.MetaIncludes.forEach(
        metaIncludes => {
          metaIncludes.MetaInclude.forEach(
            metaInclude => {
              var libPath = path.dirname(metaConfigFilename) +
                path.sep + metaInclude.$.path;

              // All we have from the meta config file is the *path* to
              // the library metadata.
              // We also know about the .libmeta file extension, but we
              // don't know the actual name of the library meta file(s) ...
              // ... so find them.
              glob.sync(libPath + path.sep + '*' + libMetaExtension).forEach(libMetaFile => {

                // Read the library metadata.
                var libMetaData = fs.readFileSync(libMetaFile);
                var libConfigParser = new xml2js.Parser();
                libConfigParser.parseString(libMetaData, function (err, result) {

                  // Iterate through the list of libraries for this ... library.
                  result.MetaConfigurationDocument.Library.forEach(library => {
                    // Iterate through the list of files for this library.
                    library.File.forEach(file => {
                    });
                    // Iterate through the list of component includes
                    // for this library.
                    library.ComponentIncludes.forEach(componentIncludes => {
                      // Iterate through the list of includes for this component.
                      componentIncludes.Include.forEach(include => {
                        var compMetaFile = path.dirname(libMetaFile) +
                          path.sep + include.$.path;

                        // Read the Component metadata
                        var compMetaData = fs.readFileSync(compMetaFile);
                        var compConfigParser = new xml2js.Parser();
                        compConfigParser.parseString(
                          compMetaData,
                          function (err, result) {

                            // Iterate through the list of components for this ... component.
                            result.MetaConfigurationDocument.Component.forEach(component => {
                              // Iterate through the list of program includes for this component.
                              component.ProgramIncludes.forEach(programIncludes => {
                                // Iterate through the list of includes for this program.
                                programIncludes.Include.forEach(include => {
                                  var progMetaFile = path.dirname(compMetaFile) + path.sep + include.$.path;

                                  // Read the Program metadata
                                  var progMetaData = fs.readFileSync(progMetaFile);
                                  var progConfigParser = new xml2js.Parser();
                                  progConfigParser.parseString(progMetaData, function (err, result) {

                                    // Iterate through the list of programs for this ... program.
                                    result.MetaConfigurationDocument.Program.forEach(program => {
                                      var newNode = { key: library.$.name + '.' + component.$.name + '.' + program.$.name, name: program.$.name, leftArray: [], rightArray: [] };

                                      // Iterate through the list of ports for this program.
                                      program.Ports.forEach(ports => {
                                        // Iterate through each port in this list.
                                        ports.Port.forEach(port => {
                                          var multiplicity = port.$.multiplicity;
                                          if (port.$.kind === 'Input')
                                            newNode.leftArray.push ({
                                              portId: port.$.name, text: port.$.name, type: port.$.type + (
                                                multiplicity === '1'
                                                  ? ''
                                                  : '[' + multiplicity + ']'
                                              )
                                            });
                                          if (port.$.kind === 'Output')
                                            newNode.rightArray.push({
                                              portId: port.$.name, text: port.$.name,
                                              type: port.$.type + (
                                                multiplicity === '1'
                                                  ? ''
                                                  : '[' + multiplicity + ']'
                                              )
                                            });
                                        });
                                      });
                                      programs.push(newNode);
                                    });
                                  });
                                });
                              });
                            }
                          );
                        });
                      });
                    });
                  });
                });
              });
            }
          );
        }
      );
    }
  );

  return programs;
};

/**
 * Gets a PLCnext Technology ESM configuration.
 * See separate documentation for json schemas. 
 * @param {string} esmConfigFileName - the name of an ESM configuration file.
 * @param {string} acfConfigFileName - the name of an ACF configuration file.
 * @returns {Object[]} a list of ESM configuration elements.
 */
exports.getEsmConfig = function (esmConfigFilename, acfConfigFilename) {

  var esmConfig = [
    { key: 'PLCnext', name: 'PLCnext'},
    { key: 'ESM1', name: 'ESM1', parent: 'PLCnext'},
    { key: 'ESM2', name: 'ESM2', parent: 'PLCnext'}
  ];

  // Get the list of Libraries, Components and Component Instances.
  var componentTypes = {};

  // Read acf configuration data.
  var acfConfigData = fs.readFileSync(acfConfigFilename);

  // Parse the XML acf configuration data.
  var acfConfigParser = new xml2js.Parser();
  acfConfigParser.parseString(acfConfigData, function (err, result) {

    // Iterate through the list of Components.
    result.AcfConfigurationDocument.Components.forEach(components => {
      components.Component.forEach(component => {
        componentTypes[component.$.name] = component.$.library +
          '.' + component.$.type;
      });
    });
  });

  //TODO: Include checks on the existence of all files.
  //TODO: Include information on the Task that each instance is associated with.

  // Read esm data.
  var esmConfigData = fs.readFileSync(esmConfigFilename);

  // Parse the XML esm configuration data.
  var esmConfigParser = new xml2js.Parser();
  esmConfigParser.parseString(esmConfigData, function (err, result) {

    // Iterate through the list of tasks.
    // TODO: Check other tasks, not just Cyclic tasks.
    result.EsmConfigurationDocument.Tasks.forEach(tasks => {
      tasks.CyclicTask.forEach(cyclicTask => {
        // TODO: Add the other Task attributes.
        var newTask = {
          key: cyclicTask.$.name,
          name: cyclicTask.$.name,
          parent: '' };
        esmConfig.push(newTask);
      });
    });

    // Iterate through the list of ESM/task relations.
    result.EsmConfigurationDocument.EsmTaskRelations.forEach(relations => {
      relations.EsmTaskRelation.forEach(relation => {
        // Get the Task object from the esmConfig.
        var esmTask = esmConfig.filter(
          task => task.key == relation.$.taskName
        )
        // Set the parent property of the task.
        // TODO: Check that there is one and only one element in the array.
        esmTask[0].parent = relation.$.esmName;
      });
    });

    // Iterate through the list of Programs to determine all program instances.
    result.EsmConfigurationDocument.Programs.forEach(programs => {
      programs.Program.forEach(program => {
        // TODO: Check if the component is in the ACF configuration
        // (e.g. Eclr). If not, ignore it.
        var newProgram = {
          key: program.$.componentName + '/' + program.$.name,
          name: program.$.name,
          parent: '' };
        esmConfig.push(newProgram);
      });
    });

    // Iterate through the list of task/program relations.
    result.EsmConfigurationDocument.TaskProgramRelations.forEach(relations => {
      relations.TaskProgramRelation.forEach(relation => {
        // Get the Program object from the esmConfig.
        var taskProgram = esmConfig.filter(
          program => program.key == relation.$.programName
        )
        // Set the parent property of the program.
        // TODO: Check that there is one and only one element in the array.
        taskProgram[0].parent = relation.$.taskName;
      });
    });
  });

  console.log(esmConfig);

  return esmConfig;
};

/**
 * Gets a list of program instances available in a
 * PLCnext Technology configuration.
 * See separate documentation for json schemas. 
 * @param {string} acfConfigFileName - the name of an ACF configuration file.
 * @param {string} esmConfigFileName - the name of an ESM configuration file.
 * @returns {Object[]} a list of defined program instances.
 */
exports.getProgramInstances = function (acfConfigFilename, esmConfigFilename) {

  // Get the list of Libraries, Components and Component Instances.
  var componentTypes = {};

  // Read acf configuration data.
  var acfConfigData = fs.readFileSync(acfConfigFilename);

  // Parse the XML acf configuration data.
  var acfConfigParser = new xml2js.Parser();
  acfConfigParser.parseString(acfConfigData, function (err, result) {

    // Iterate through the list of Components.
    result.AcfConfigurationDocument.Components.forEach(components => {
      components.Component.forEach(component => {
        componentTypes[component.$.name] = component.$.library +
          '.' + component.$.type;
      });
    });
  });

  var programInstances = [];

  //TODO: Include checks on the existence of all files.
  //TODO: Include information on the Task that each instance is associated with.

  // Read esm data.
  var esmConfigData = fs.readFileSync(esmConfigFilename);

  // Parse the XML esm configuration data.
  var esmConfigParser = new xml2js.Parser();
  esmConfigParser.parseString(esmConfigData, function (err, result) {

    // Iterate through the list of Programs to determine all program instances.
    result.EsmConfigurationDocument.Programs.forEach(programs => {
      programs.Program.forEach(program => {
        // TODO: Check if the component is in the ACF configuration
        // (e.g. Eclr). If not, ignore it.
        var newNode = { category: componentTypes[program.$.componentName] + '.' + program.$.programType, key: program.$.componentName + '/' + program.$.name, name: program.$.name };
        programInstances.push(newNode);
      });
    });
  });

  return programInstances;
};

/**
 * Gets a list of connections between objects in a
 * PLCnext Technology configuration.
 * See separate documentation for json schemas. 
 * @param {string} gdsConfigFileName - the name of a GDS configuration file.
 * @returns {Object[]} a list of defined connections.
 */
exports.getConnections = function (gdsConfigFileName) {

  var connections = [];

  // Read gds data.
  var gdsConfigData = fs.readFileSync(gdsConfigFileName);

  // Parse the XML gds configuration data.
  var gdsConfigParser = new xml2js.Parser();
  gdsConfigParser.parseString(gdsConfigData, function (err, result) {

    // Iterate through the list of Connector elements to determine all port connections.
    result.GdsConfigurationDocument.Connectors.forEach(connectors => {
      connectors.Connector.forEach(connector => {

        // Split the startPort and endPort attributes into Node and Port.
        var startPort = connector.$.startPort.split(':');
        var endPort = connector.$.endPort.split(':');

        // Add the link to the model.
        connections.push({ from: startPort[0], to: endPort[0], fromPort: startPort[1], toPort: endPort[1] });
      });
    });
  });
  return connections;
};

/**
 * Sets connections between objects in a
 * PLCnext Technology configuration.
 * See separate documentation for json schemas. 
 * @param {string} linkData - a list of object connections.
 * @param {string} gdsConfigFileName - the name of a GDS configuration file.
 */
exports.setConnections = function (linkData, gdsConfigFileName) {

  // Declare the target json object in the format that the Builder
  // will convert to valid GDS XML.
  var json = { $: { schemaVersion: '1.0' }, Connectors: [{ Connector: [] }] };

  // Process the linkData from the go.js model.
  linkData.forEach(link => {
    json.Connectors[0].Connector.push({ $: { startPort: link.from + ':' + link.fromPort, endPort: link.to + ':' + link.toPort } });
  });

  // Create the XML Builder and write the XML to file.
  var builder = new xml2js.Builder({ rootName: 'GdsConfigurationDocument', headless: true });
  fs.writeFileSync(gdsConfigFileName, builder.buildObject(json));
};
