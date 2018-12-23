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
  var globalObjects = require("./global-objects.json");
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
 * Reads a PLCnext Control library metadata file.
 * See separate documentation for json schemas. 
 * @param {string} libmetaFileName - the name of a libmeta file.
 * @returns {Object[]} library metadata in JSON.
 */
exports.readLibmeta = function (libmetaFileName) {

  // Create default (empty) object.
  var libmeta = [];

  // Read meta configuration data.
  var libmetaData = fs.readFileSync(libmetaFileName);

  // Parse the XML library meta data.
  var libmetaParser = new xml2js.Parser();
  libmetaParser.parseString(libmetaData, function (err, result) {

    // Iterate through the list of libraries in this file.
    result.MetaConfigurationDocument.Library.forEach(library => {

      // Create a new library object.
      // It is assumed that there will only be one Library File 
      // specified in any libmeta file. This is a reasonable
      // assumption because otherwise, how does the ACF know 
      // which library file contains the components listed
      // in the ComponentIncludes files?
      var newLibrary = {
        name: library.$.name,
        applicationDomain: library.$.applicationDomain,
        File: {path: library.File[0].$.path},
        TypeIncludes: [],
        ComponentIncludes: []
      };

      // Iterate through the list of type includes for this library.
      library.TypeIncludes.forEach(typeIncludes => {
        // Iterate through the list of includes for this type.
        typeIncludes.Include.forEach(include => {
          newLibrary.TypeIncludes.push(include.$.path);
        });
      });
      
      // Iterate through the list of component includes for this library.
      library.ComponentIncludes.forEach(componentIncludes => {
        // Iterate through the list of includes for this component.
        componentIncludes.Include.forEach(include => {
          newLibrary.ComponentIncludes.push(include.$.path);
        });
      });

      // Add the new library object to the array.
      libmeta.push (newLibrary);
    });
  });
  return libmeta;
}

/**
 * Reads a PLCnext Control type metadata file.
 * See separate documentation for json schemas. 
 * @param {string} typemetaFileName - the name of a typemeta file.
 * @returns {Object[]} type metadata in JSON.
 */
exports.readTypemeta = function (typemetaFileName) {

  // Create default (empty) object.
  var typemeta = [];

  // Read meta configuration data.
  var typemetaData = fs.readFileSync(typemetaFileName);

  // Parse the XML type meta data.
  var typemetaParser = new xml2js.Parser();
  typemetaParser.parseString(typemetaData, function (err, result) {
    // Iterate through the list of types in this file.
    result.MetaConfigurationDocument.Types.forEach(types => {
      if (typeof types === 'object') {
        types.Type.forEach(type => {
          // Create a new type object.
            var newType = {
            name: type.$.name
          };
          // Add the new type object to the array.
          typemeta.push (newType);
        });
      }
      else console.log("Warning: No types are defined.");
    });
  });
  return typemeta;
}

/**
 * Reads a PLCnext Control component metadata file.
 * See separate documentation for json schemas. 
 * @param {string} compmetaFileName - the name of a compmeta file.
 * @returns {Object[]} component metadata in JSON.
 */
exports.readCompmeta = function (compmetaFileName) {

  // Create default (empty) object.
  var compmeta = [];

  // Read meta configuration data.
  var compmetaData = fs.readFileSync(compmetaFileName);

  // Parse the XML component meta data.
  var compmetaParser = new xml2js.Parser();
  compmetaParser.parseString(compmetaData, function (err, result) {
    // Iterate through the list of components in this file.
    result.MetaConfigurationDocument.Component.forEach(component => {

      // Create a new component object.
      var newComponent = {
        type: component.$.type,
        ProgramIncludes: [],
        Ports: []
      };

      // Iterate through the program includes.
      component.ProgramIncludes.forEach(programIncludes => {
        if (typeof programIncludes === 'object') {
          // Iterate through the includes.
          programIncludes.Include.forEach(include => {
            newComponent.ProgramIncludes.push(include.$.path);
          });
        }
        else console.log("No programs are defined.");
      });

      // Iterate through the ports.
      component.Ports.forEach(ports => {
        if (typeof ports === 'object') {
          // Iterate through the ports.
          ports.Port.forEach(port => {
            newComponent.Ports.push({
              "name": port.$.name,
              "type": port.$.type,
              "attributes": port.$.attributes,
              "dimensions": (port.$.dimensions === "" ? null : parseInt(port.$.dimensions))
            });
          });
        }
        else console.log("No ports are defined.");
      });

      // Add the new component object to the array.
      compmeta.push (newComponent);
    });
  });
  return compmeta;
}

/**
 * Reads a PLCnext Control program metadata file.
 * See separate documentation for json schemas. 
 * @param {string} progmetaFileName - the name of a progmeta file.
 * @returns {Object[]} program metadata in JSON.
 */
exports.readProgmeta = function (progmetaFileName) {

  // Create default (empty) object.
  var progmeta = [];

  // Read meta configuration data.
  var progmetaData = fs.readFileSync(progmetaFileName);

  // Parse the XML program meta data.
  var progmetaParser = new xml2js.Parser();
  progmetaParser.parseString(progmetaData, function (err, result) {
    // Iterate through the list of programs in this file.
    result.MetaConfigurationDocument.Program.forEach(program => {

      // Create a new program object.
      var newProgram = {
        type: program.$.type,
        Ports: []
      };

      // Iterate through the ports.
      program.Ports.forEach(ports => {
        if (typeof ports === 'object') {
          // Iterate through the ports.
          ports.Port.forEach(port => {
            newProgram.Ports.push({
              "name": port.$.name,
              "type": port.$.type,
              "attributes": port.$.attributes,
              "dimensions": (port.$.dimensions === "" ? null : parseInt(port.$.dimensions))
            });
          });
        }
        else console.log("No ports are defined.");
      });

      // Add the new component object to the array.
      progmeta.push (newProgram);
    });
  });
  return progmeta;
}

/**
 * Gets a list of component and program types available
 * for a specific PLCnext Technology project.
 * See separate documentation for json schemas. 
 * @param {string} metaConfigFileName - the name of a meta configuration file.
 * @returns {Object[]} a list of defined programs.
 */
exports.getTypes = function (metaConfigFilename) {

  // Construct information about all the components and programs referenced
  // in the specified configuration file.
  var componentTypes = [];
  var programTypes = [];

  //TODO: Include checks on the existence of all files.
  //TODO: Fully qualfiy each program (Library, Component etc.).

  // Read meta configuration data.
  var metaConfigData = fs.readFileSync(metaConfigFilename);

  // Parse the XML meta configuration data.
  var metaConfigParser = new xml2js.Parser();
  metaConfigParser.parseString(
    metaConfigData,
    function (err, result) {

      // Iterate through the list of library metadata files.
      result.MetaConfigurationDocument.Includes.forEach(
        includes => {
          includes.Include.forEach(
            include => {
              var libMetaFile = path.dirname(metaConfigFilename) +
                path.sep + include.$.path;

              // glob.sync(libPath + path.sep + '*' + libMetaExtension).forEach(libMetaFile => {

              // Read the library metadata.
              var libMetaData = fs.readFileSync(libMetaFile);
              var libConfigParser = new xml2js.Parser();
              libConfigParser.parseString(libMetaData, function (err, result) {

                // Iterate through the list of libraries for this ... library.
                result.MetaConfigurationDocument.Library.forEach(library => {
                  // Iterate through the list of files for this library.
                  library.File.forEach(file => {
                    // This is the Shared Object library!
                    // Do something with this?
                  });
                  // Iterate through the list of type includes for this library.
                  library.TypeIncludes.forEach(typeIncludes => {
                    // Iterate through the list of includes for this type.
                    typeIncludes.Include.forEach(include => {
                      // Do something with this?
                      // What is the format of the .typemeta file?
                    });
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
                            var newComponent = { key: library.$.name + '.' + component.$.type, name: component.$.type, leftArray: [], rightArray: [] };

                            // Iterate through the list of ports for this component.
                            component.Ports.forEach(ports => {
                              // Iterate through each port in this list.
                              ports.Port.forEach(port => {
                                var dimensions = port.$.dimensions;
                                // TODO: attributes may include more information
                                if (port.$.attributes === 'Input')
                                  newComponent.leftArray.push ({
                                    portId: port.$.name, text: port.$.name, type: port.$.type + (
                                      dimensions === ''
                                        ? ''
                                        : '[' + dimensions + ']'
                                    )
                                  });
                                // TODO: attributes may include more information
                                if (port.$.attributes === 'Output')
                                  newComponent.rightArray.push({
                                    portId: port.$.name, text: port.$.name,
                                    type: port.$.type + (
                                      dimensions === ''
                                        ? ''
                                        : '[' + dimensions + ']'
                                    )
                                  });
                              });
                            });
                            componentTypes.push(newComponent);

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
                                          // TODO: attributes may include more information
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
                                    programTypes.push(newNode);
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
