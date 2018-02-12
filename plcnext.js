// Functions in this package use "paths" to config files rather than "projects", since in theory
// it's possible to construct a run-time using configuration files from different "projects".
// So why "projects" at all ... ?

"use strict";

const projectFolder = '/opt/plcnext/projects';
const fs = require('fs');
const path = require('path');
var glob = require('glob');
var xml2js = require('xml2js');

// TIC FILE RULES:
// Each TIC file can have one or more Elements.
// Each Element can have zero or one Element Lists.
// Each Element can have zero or one Attribute Lists.
// Each Element List can have one or more Elements.
// Each Attribute List can have one or more Attributes.
// Each Attribute has exactly one Value.

// link.xml files specify relationships between PARENT and CHILD files.
//
// PARENT files contain elements named:
// - AXLF:Controller
//   - IO:Frames
//     - IO:Frame
//       - IO:Ports
//         - IO:Port -> Values for attribute 'NodeId' must appear in CHILD files.
//
// CHILD files contain elements named:
// - AXLF:Device -> One attribute is 'NodeId'
//   - PARAS
//     - PARA

var getElements = function(elementList) {
  var elements = [];

  // Check that the element list contains at least one element.
  if ('E' in elementList) {
    elementList.E.forEach(element => {
      var attributes = [];
      
      // Check if the element has an attribute list and, if so, that the list contains at least one attribute.
      if ('AL' in element && 'A' in element.AL[0]) {
        element.AL[0].A.forEach(attribute => {
          attributes.push({name: attribute.$.n, value: attribute.V[0]});
        });
      }
      elements.push({name: element.$.n, elementList: ('EL' in element ? element.EL[0] : []), attributes: attributes});
    });
  }
  return elements;
};

var walkElementTree = function(elementList) {
  var elements = getElements(elementList);
  elements.forEach(element => {
    console.log('Element name: ' + element.name);
    element.attributes.forEach(attribute => {
      console.log('  Attribute: ' + attribute.name + ' ' + attribute.value);
    });
    walkElementTree(element.elementList);
  });
};

exports.getGlobalObjects = function() {
  var globalObjects = [
    { key: 'Arp.Io.FbIo.AxlC/',
      name: 'AxlC',
      leftArray: [],
      rightArray:[
        //TODO: Remove portColour and change to "type". Then, in the Model, use the Type to display a port ToolTip and/or Colour.
        {portId: 'AXIO_DIAG_STATUS_REG_HI', text: 'AXIO_DIAG_STATUS_REG_HI', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_LOW', text: 'AXIO_DIAG_STATUS_REG_LOW', type:'uint16'},
        {portId: 'AXIO_DIAG_PARAM_REG_HI', text: 'AXIO_DIAG_PARAM_REG_HI', type:'uint16'},
        {portId: 'AXIO_DIAG_PARAM_REG_LOW', text: 'AXIO_DIAG_PARAM_REG_LOW', type:'uint16'},
        {portId: 'AXIO_DIAG_PARAM_2_REG_HI', text: 'AXIO_DIAG_PARAM_2_REG_HI', type:'uint16'},
        {portId: 'AXIO_DIAG_PARAM_2_REG_LOW', text: 'AXIO_DIAG_PARAM_2_REG_LOW', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_PF', text: 'AXIO_DIAG_STATUS_REG_PF', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_BUS', text: 'AXIO_DIAG_STATUS_REG_BUS', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_RUN', text: 'AXIO_DIAG_STATUS_REG_RUN', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_ACT', text: 'AXIO_DIAG_STATUS_REG_ACT', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_RDY', text: 'AXIO_DIAG_STATUS_REG_RDY', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_SYSFAIL', text: 'AXIO_DIAG_STATUS_REG_SYSFAIL', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_PW', text: 'AXIO_DIAG_STATUS_REG_PW', type:'uint16'}
      ]
    },
    { key: 'Arp.Io.FbIo.PnC/',
      name: 'PnC',
      leftArray: [
        {portId: 'PNIO_FORCE_FAILSAFE', text: 'PNIO_FORCE_FAILSAFE', type:'bit'}
      ],
      rightArray:[
        {portId: 'PNIO_SYSTEM_BF', text: 'PNIO_SYSTEM_BF', type:'bit'},
        {portId: 'PNIO_SYSTEM_SF', text: 'PNIO_SYSTEM_SF', type:'bit'},
        {portId: 'PNIO_MAINTENANCE_DEMANDED', text: 'PNIO_MAINTENANCE_DEMANDED', type:'bit'},
        {portId: 'PNIO_MAINTENANCE_REQUIRED', text: 'PNIO_MAINTENANCE_REQUIRED', type:'bit'},
        {portId: 'PNIO_CONFIG_STATUS', text: 'PNIO_CONFIG_STATUS', type:'bit'},
        {portId: 'PNIO_CONFIG_STATUS_ACTIVE', text: 'PNIO_CONFIG_STATUS_ACTIVE', type:'bit'},
        {portId: 'PNIO_CONFIG_STATUS_READY', text: 'PNIO_CONFIG_STATUS_READY', type:'bit'},
        {portId: 'PNIO_CONFIG_STATUS_CFG_FAULT', text: 'PNIO_CONFIG_STATUS_CFG_FAULT', type:'bit'}
      ]
    },
    { key: 'Arp.Io.FbIo.PnD/',
      name: 'PnD',
      leftArray: [
        {portId: 'PND_S1_OUTPUTS', text: 'PND_S1_OUTPUTS', type:'uint16'}
      ],
      rightArray:[
        {portId: 'PND_S1_PLC_RUN', text: 'PND_S1_PLC_RUN', type:'bit'},
        {portId: 'PND_S1_VALID_DATA_CYCLE', text: 'PND_S1_VALID_DATA_CYCLE', type:'bit'},
        {portId: 'PND_S1_OUTPUT_STATUS_GOOD', text: 'PND_S1_OUTPUT_STATUS_GOOD', type:'bit'},
        {portId: 'PND_S1_INPUT_STATUS_GOOD', text: 'PND_S1_INPUT_STATUS_GOOD', type:'bit'},
        {portId: 'PND_S1_DATA_LENGTH', text: 'PND_S1_DATA_LENGTH', type:'uint16'},
        {portId: 'PND_S1_INPUTS', text: 'PND_S1_INPUTS', type:'uint16'}
      ]
    },
    { key: 'Arp.Plc.Esm/',
      name: 'Esm',
      leftArray: [],
      rightArray:[
        {portId: 'ESM_COUNT', text: 'ESM_COUNT', type:'uint16'},
        {portId: 'ESM_1_TASKS_USED', text: 'ESM_1_TASKS_USED', type:'uint16'},
        {portId: 'ESM_1_TASK_1', text: 'ESM_1_TASK_1', type:'bit'},
        {portId: 'ESM_1_TASK_2', text: 'ESM_1_TASK_2', type:'bit'},
        {portId: 'ESM_1_TASK_3', text: 'ESM_1_TASK_3', type:'bit'},
        {portId: 'ESM_1_TASK_4', text: 'ESM_1_TASK_4', type:'bit'},
        {portId: 'ESM_1_TASK_5', text: 'ESM_1_TASK_5', type:'bit'},
        {portId: 'ESM_1_TASK_6', text: 'ESM_1_TASK_6', type:'bit'},
        {portId: 'ESM_1_TASK_7', text: 'ESM_1_TASK_7', type:'bit'},
        {portId: 'ESM_1_TASK_8', text: 'ESM_1_TASK_8', type:'bit'},
        {portId: 'ESM_1_TASK_9', text: 'ESM_1_TASK_9', type:'bit'},
        {portId: 'ESM_1_TASK_10', text: 'ESM_1_TASK_10', type:'bit'},
        {portId: 'ESM_1_TASK_11', text: 'ESM_1_TASK_11', type:'bit'},
        {portId: 'ESM_1_TASK_12', text: 'ESM_1_TASK_12', type:'bit'},
        {portId: 'ESM_1_TASK_13', text: 'ESM_1_TASK_13', type:'bit'},
        {portId: 'ESM_1_TASK_14', text: 'ESM_1_TASK_14', type:'bit'},
        {portId: 'ESM_1_TASK_15', text: 'ESM_1_TASK_15', type:'bit'},
        {portId: 'ESM_1_TASK_16', text: 'ESM_1_TASK_16', type:'bit'},
        {portId: 'ESM_2_TASKS_USED', text: 'ESM_2_TASKS_USED', type:'uint16'},
        {portId: 'ESM_2_TASK_1', text: 'ESM_2_TASK_1', type:'bit'},
        {portId: 'ESM_2_TASK_2', text: 'ESM_2_TASK_2', type:'bit'},
        {portId: 'ESM_2_TASK_3', text: 'ESM_2_TASK_3', type:'bit'},
        {portId: 'ESM_2_TASK_4', text: 'ESM_2_TASK_4', type:'bit'},
        {portId: 'ESM_2_TASK_5', text: 'ESM_2_TASK_5', type:'bit'},
        {portId: 'ESM_2_TASK_6', text: 'ESM_2_TASK_6', type:'bit'},
        {portId: 'ESM_2_TASK_7', text: 'ESM_2_TASK_7', type:'bit'},
        {portId: 'ESM_2_TASK_8', text: 'ESM_2_TASK_8', type:'bit'},
        {portId: 'ESM_2_TASK_9', text: 'ESM_2_TASK_9', type:'bit'},
        {portId: 'ESM_2_TASK_10', text: 'ESM_2_TASK_10', type:'bit'},
        {portId: 'ESM_2_TASK_11', text: 'ESM_2_TASK_11', type:'bit'},
        {portId: 'ESM_2_TASK_12', text: 'ESM_2_TASK_12', type:'bit'},
        {portId: 'ESM_2_TASK_13', text: 'ESM_2_TASK_13', type:'bit'},
        {portId: 'ESM_2_TASK_14', text: 'ESM_2_TASK_14', type:'bit'},
        {portId: 'ESM_2_TASK_15', text: 'ESM_2_TASK_15', type:'bit'},
        {portId: 'ESM_2_TASK_16', text: 'ESM_2_TASK_16', type:'bit'}
      ]
    },
    { key: 'Arp.Plc.Eclr/',
      name: 'Eclr',
      leftArray: [
        {portId: 'AXIO_DIAG_STATUS_REG_HI', text: 'AXIO_DIAG_STATUS_REG_HI', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_LOW', text: 'AXIO_DIAG_STATUS_REG_LOW', type:'uint16'},
        {portId: 'AXIO_DIAG_PARAM_REG_HI', text: 'AXIO_DIAG_PARAM_REG_HI', type:'uint16'},
        {portId: 'AXIO_DIAG_PARAM_REG_LOW', text: 'AXIO_DIAG_PARAM_REG_LOW', type:'uint16'},
        {portId: 'AXIO_DIAG_PARAM_2_REG_HI', text: 'AXIO_DIAG_PARAM_2_REG_HI', type:'uint16'},
        {portId: 'AXIO_DIAG_PARAM_2_REG_LOW', text: 'AXIO_DIAG_PARAM_2_REG_LOW', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_PF', text: 'AXIO_DIAG_STATUS_REG_PF', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_BUS', text: 'AXIO_DIAG_STATUS_REG_BUS', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_RUN', text: 'AXIO_DIAG_STATUS_REG_RUN', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_ACT', text: 'AXIO_DIAG_STATUS_REG_ACT', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_RDY', text: 'AXIO_DIAG_STATUS_REG_RDY', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_SYSFAIL', text: 'AXIO_DIAG_STATUS_REG_SYSFAIL', type:'uint16'},
        {portId: 'AXIO_DIAG_STATUS_REG_PW', text: 'AXIO_DIAG_STATUS_REG_PW', type:'uint16'},
        
        {portId: 'PNIO_SYSTEM_BF', text: 'PNIO_SYSTEM_BF', type:'bit'},
        {portId: 'PNIO_SYSTEM_SF', text: 'PNIO_SYSTEM_SF', type:'bit'},
        {portId: 'PNIO_MAINTENANCE_DEMANDED', text: 'PNIO_MAINTENANCE_DEMANDED', type:'bit'},
        {portId: 'PNIO_MAINTENANCE_REQUIRED', text: 'PNIO_MAINTENANCE_REQUIRED', type:'bit'},
        {portId: 'PNIO_CONFIG_STATUS', text: 'PNIO_CONFIG_STATUS', type:'bit'},
        {portId: 'PNIO_CONFIG_STATUS_ACTIVE', text: 'PNIO_CONFIG_STATUS_ACTIVE', type:'bit'},
        {portId: 'PNIO_CONFIG_STATUS_READY', text: 'PNIO_CONFIG_STATUS_READY', type:'bit'},
        {portId: 'PNIO_CONFIG_STATUS_CFG_FAULT', text: 'PNIO_CONFIG_STATUS_CFG_FAULT', type:'bit'},

        {portId: 'PND_S1_PLC_RUN', text: 'PND_S1_PLC_RUN', type:'bit'},
        {portId: 'PND_S1_VALID_DATA_CYCLE', text: 'PND_S1_VALID_DATA_CYCLE', type:'bit'},
        {portId: 'PND_S1_OUTPUT_STATUS_GOOD', text: 'PND_S1_OUTPUT_STATUS_GOOD', type:'bit'},
        {portId: 'PND_S1_INPUT_STATUS_GOOD', text: 'PND_S1_INPUT_STATUS_GOOD', type:'bit'},
        {portId: 'PND_S1_DATA_LENGTH', text: 'PND_S1_DATA_LENGTH', type:'uint16'},
        {portId: 'PND_S1_INPUTS', text: 'PND_S1_INPUTS', type:'uint16'},
        
        {portId: 'ESM_COUNT', text: 'ESM_COUNT', type:'uint16'},
        {portId: 'ESM_1_TASKS_USED', text: 'ESM_1_TASKS_USED', type:'uint16'},
        {portId: 'ESM_1_TASK_1', text: 'ESM_1_TASK_1', type:'bit'},
        {portId: 'ESM_1_TASK_2', text: 'ESM_1_TASK_2', type:'bit'},
        {portId: 'ESM_1_TASK_3', text: 'ESM_1_TASK_3', type:'bit'},
        {portId: 'ESM_1_TASK_4', text: 'ESM_1_TASK_4', type:'bit'},
        {portId: 'ESM_1_TASK_5', text: 'ESM_1_TASK_5', type:'bit'},
        {portId: 'ESM_1_TASK_6', text: 'ESM_1_TASK_6', type:'bit'},
        {portId: 'ESM_1_TASK_7', text: 'ESM_1_TASK_7', type:'bit'},
        {portId: 'ESM_1_TASK_8', text: 'ESM_1_TASK_8', type:'bit'},
        {portId: 'ESM_1_TASK_9', text: 'ESM_1_TASK_9', type:'bit'},
        {portId: 'ESM_1_TASK_10', text: 'ESM_1_TASK_10', type:'bit'},
        {portId: 'ESM_1_TASK_11', text: 'ESM_1_TASK_11', type:'bit'},
        {portId: 'ESM_1_TASK_12', text: 'ESM_1_TASK_12', type:'bit'},
        {portId: 'ESM_1_TASK_13', text: 'ESM_1_TASK_13', type:'bit'},
        {portId: 'ESM_1_TASK_14', text: 'ESM_1_TASK_14', type:'bit'},
        {portId: 'ESM_1_TASK_15', text: 'ESM_1_TASK_15', type:'bit'},
        {portId: 'ESM_1_TASK_16', text: 'ESM_1_TASK_16', type:'bit'},
        {portId: 'ESM_2_TASKS_USED', text: 'ESM_2_TASKS_USED', type:'uint16'},
        {portId: 'ESM_2_TASK_1', text: 'ESM_2_TASK_1', type:'bit'},
        {portId: 'ESM_2_TASK_2', text: 'ESM_2_TASK_2', type:'bit'},
        {portId: 'ESM_2_TASK_3', text: 'ESM_2_TASK_3', type:'bit'},
        {portId: 'ESM_2_TASK_4', text: 'ESM_2_TASK_4', type:'bit'},
        {portId: 'ESM_2_TASK_5', text: 'ESM_2_TASK_5', type:'bit'},
        {portId: 'ESM_2_TASK_6', text: 'ESM_2_TASK_6', type:'bit'},
        {portId: 'ESM_2_TASK_7', text: 'ESM_2_TASK_7', type:'bit'},
        {portId: 'ESM_2_TASK_8', text: 'ESM_2_TASK_8', type:'bit'},
        {portId: 'ESM_2_TASK_9', text: 'ESM_2_TASK_9', type:'bit'},
        {portId: 'ESM_2_TASK_10', text: 'ESM_2_TASK_10', type:'bit'},
        {portId: 'ESM_2_TASK_11', text: 'ESM_2_TASK_11', type:'bit'},
        {portId: 'ESM_2_TASK_12', text: 'ESM_2_TASK_12', type:'bit'},
        {portId: 'ESM_2_TASK_13', text: 'ESM_2_TASK_13', type:'bit'},
        {portId: 'ESM_2_TASK_14', text: 'ESM_2_TASK_14', type:'bit'},
        {portId: 'ESM_2_TASK_15', text: 'ESM_2_TASK_15', type:'bit'},
        {portId: 'ESM_2_TASK_16', text: 'ESM_2_TASK_16', type:'bit'}
      ],
      rightArray:[
        {portId: 'PNIO_FORCE_FAILSAFE', text: 'PNIO_FORCE_FAILSAFE', type:'bit'},
        {portId: 'PND_S1_OUTPUTS', text: 'PND_S1_OUTPUTS', type:'uint16'}
      ]
    },
  ];

  return globalObjects;
};

exports.getIoModules = function(ticFileName) {
  // Reads the IO from the specified file.
  // TODO: Read the file project/Io/Arp.Io.AxlC/links.xml.
  // - or, alternatively, get the name of the links file from the Default/Io directory.
  // This gives the name of the .tic file to read (UUID.tic).
  // Then read the tic file and extract the info needed for the GDS connections.
  // Construct information about all the programs in the specified project.

  // This function defines two internal nested functions - getFrames and getPorts.
  // These functions are called recusrsively to search the TIC element tree for IO:Frame elements,
  // and then IO:Port elements.
  
  var ioModules = [];
  
  //TODO: Include checks on the existence of all files.
  //TODO: Fully qualfiy each program (Library, Component etc.).
  
//  console.log('Reading link data from: ' + linkFileName);
  
  // Read TIC link file.
//  var linkData = fs.readFileSync(linkFileName)

  // Parse the XML link data.
//  var linkParser = new xml2js.Parser();
//  linkParser.parseString(linkData, function (err, result) {
    
    // Iterate through the list of tic files.
//    result.TIC.Arc.forEach(arc => {
      
//       // Process the Device (child) files simply to determine the list of Node numbers.
//       // NOTE: This isn't really necessary because the Node numbers also appear in the Controller (parent) file.
//       var ticFileName = arc.$.to;
//       console.log('TIC file name: ' + path.dirname(linkFileName) + path.sep + ticFileName);
//       
//       // Read IO configuration data from the TIC file.
//       var ioData = fs.readFileSync(path.dirname(linkFileName) + path.sep + ticFileName)
// 
//       // Parse the XML IO data.
//       var ioParser = new xml2js.Parser();
//       ioParser.parseString(ioData, function (err, result) {
//         var elements = getElements(result.TIC);
//         elements.forEach(element => {
//           console.log('Element name: ' + element.name);
//           if (element.name == 'AXLF:Device') {
//             element.attributes.forEach(attribute => {
//               console.log('  Attribute: ' + attribute.name + ' ' + attribute.value);
//               if (attribute.name == 'NodeId') {
//                 console.log('        NodeId: ' + attribute.value);
//                 var newNode = { key: 'Arp.Io.FbIo.AxlC/' + attribute.value, name: 'AxlC/' + attribute.value, inputs: [], outputs: [] };
//               }
//             });
//           }
//         });
//       });

      // Process the Controller (parent) files.
//      var ticFileName = arc.$.from;
//      console.log('TIC file name: ' + path.dirname(linkFileName) + path.sep + ticFileName);
      
      // TODO: Include a check that we don't process the same Parent file twice.
      
      // Read IO configuration data from the TIC file.
  var ioData = fs.readFileSync(ticFileName);

  // Parse the XML IO data.
  var ioParser = new xml2js.Parser();
  ioParser.parseString(ioData, function (err, result) {
    
    // getFrames: a function that walks the element tree, looking for IO:Frame elements.
    function getFrames(elementList) {
      var FrameId = '';  // Identifies the frame type as IN or OUT.

      // getPorts: a function that walks the element tree, looking for IO:Port elements.
      function getPorts(elementList) {
        var elements = getElements(elementList);
        elements.forEach(element => {
          if (element.name == 'IO:Port') {
            var NodeId, Name, DataType;
            element.attributes.forEach(attribute => {
              switch (attribute.name) {
                case 'NodeId' :
                  NodeId = attribute.value;
                  break;
                case 'Name' :
                  Name = attribute.value;
                  break;
                case 'DataType' :
                  DataType = attribute.value;
                  break;
                default:
                  break;
              }
            });

            // Create a new Node with this NodeId, if it doesn't exist.
            var thisNode;
            var ioModuleKey = 'Arp.Io.FbIo.AxlC/' + NodeId;
            var ioModuleNode = ioModules.filter(node => node.key == ioModuleKey);
            if (ioModuleNode.length > 0) {
              thisNode = ioModuleNode[0];
            }
            else {
              thisNode = { key: ioModuleKey, name: 'AxlC/' + NodeId, leftArray: [], rightArray:[] };
              ioModules.push(thisNode);
            }
            
            // Add the port to the Node - either an Input or Output port, depending on the FrameId.
            switch (FrameId) {
              case '1:IN':
                thisNode.rightArray.push({portId: Name, text: Name, type: DataType});
                break;
              case '1:OUT':
                thisNode.leftArray.push({portId: Name, text: Name, type: DataType});
                break;
                default:
                  break;
            }
            // TODO: Something with the DataType - at least a ToolTip - maybe colour-code the port?
          }
          
          // Keep walking the tree looking for IO Ports.
          getPorts(element.elementList);
        });
      };

      // Get all the Elements in the Element List.
      var elements = getElements(elementList);

      // Look for IO Frame elements in the list.
      elements.forEach(element => {
        if (element.name == 'IO:Frame') {
          
          // For each IO Frame element, get the FrameId.
          element.attributes.forEach(attribute => {
            if (attribute.name == 'FrameId') FrameId = attribute.value;
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

//    });
//  });
  
  return ioModules;
};

exports.getProjects = function() {
  // Read all the projects in the PCWI folder.
  // NOTE: Projects can be stored anywhere on the PLC, but we artificially restrict
  //       the project folder ... it may be difficult to allow the user to browse 
  //       folders on the server ...
  var projects = [];
  
  fs.readdirSync(projectFolder).forEach(project => {
    console.log('  Found project: ' + project);
    projects.push(project);
  });
  
//   glob.sync('/usr/root/plcnext/Demonstrator/Config/Projects/*').forEach(project => {
//     console.log('  Found project: ' + project);
//     projects.push(project);
//   });
  return projects;
};

exports.getPrograms = function(metaConfigFilename) {
  
  // Construct information about all the programs in the specified project.
  var libMetaExtension = '.libmeta';

  var programs = [];
  
  //TODO: Include checks on the existence of all files.
  //TODO: Fully qualfiy each program (Library, Component etc.).
  
  // Read meta configuration data.
  var metaConfigData = fs.readFileSync(metaConfigFilename);

  // Parse the XML meta configuration data.
  var metaConfigParser = new xml2js.Parser();
  metaConfigParser.parseString(metaConfigData, function (err, result) {
    
    // Iterate through the list of paths where library metadata can be found.
    result.MetaConfigurationDocument.MetaIncludes.forEach(metaIncludes => {
      metaIncludes.MetaInclude.forEach(metaInclude => {
        var libPath = path.dirname(metaConfigFilename) + path.sep + metaInclude.$.path;

        // All we have from the meta config file is the *path* to the library metadata.
        // We also know about the .libmeta file extension, but we don't know the actual name of the library meta file(s) ...
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
              // Iterate through the list of component includes for this library.
              library.ComponentIncludes.forEach(componentIncludes => {
                // Iterate through the list of includes for this component.
                componentIncludes.Include.forEach(include => {
                  var compMetaFile = path.dirname(libMetaFile) + path.sep + include.$.path;
                  
                  // Read the Component metadata
                  var compMetaData = fs.readFileSync(compMetaFile);
                  var compConfigParser = new xml2js.Parser();
                  compConfigParser.parseString(compMetaData, function (err, result) {
                    
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
                                  if (port.$.kind == 'Input') newNode.leftArray.push({portId: port.$.name, text: port.$.name, type: port.$.type + (multiplicity == '1' ? '' : '[' + multiplicity + ']')});
                                  if (port.$.kind == 'Output') newNode.rightArray.push({portId: port.$.name, text: port.$.name, type: port.$.type + (multiplicity == '1' ? '' : '[' + multiplicity + ']')});
                                });
                              });
                              programs.push(newNode);
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  return programs;
};

exports.getTasks = function(project) {
  return;  
};

exports.getProgramInstances = function(acfConfigFilename, esmConfigFilename) {
  
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
        componentTypes[component.$.name] = component.$.library + '.' + component.$.type;
      });
    });
  });
  
  console.log(componentTypes);
      
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
        // TODO: Check if the component is in the ACF configuration (e.g. Eclr). If not, ignore it.
        var newNode = { category: componentTypes[program.$.componentName] + '.' + program.$.programType, key: program.$.componentName + '/' + program.$.name, name: program.$.name };
        programInstances.push(newNode);
      });
    });
  });

  console.log(programInstances);
  return programInstances;
};

exports.getConnections = function(gdsFileName) {
  
  var connections = [];
  
  // Read gds data.
  var gdsConfigData = fs.readFileSync(gdsFileName);

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
        connections.push({from:startPort[0], to:endPort[0], fromPort:startPort[1], toPort:endPort[1]});
      });
    });
  });
  return connections;
};

exports.setConnections = function(linkData, gdsFileName) {

  // Writes json data to the named GDS file.
  
  // Declare the target json object in the format that the Builder will convert to valid GDS XML.
  var json = {$:{schemaVersion:'1.0'}, Connectors:[{Connector:[]}]};

  // Process the linkData from the go.js model.
  linkData.forEach(link => {
    json.Connectors[0].Connector.push({$:{startPort: link.from + ':' + link.fromPort, endPort: link.to + ':' + link.toPort}});
  });

  // Create the XML Builder and write the XML to file.
  var builder = new xml2js.Builder({rootName:'GdsConfigurationDocument', headless: true});
  fs.writeFileSync(gdsFileName, builder.buildObject(json));
};
