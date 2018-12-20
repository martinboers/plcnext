## plcnext
A node package for use with PLCnext Technology™ controllers from Phoenix Contact.

## Code Example

```JavaScript
var plcnext = require("plcnext");

// Create program templates.
var nodeTemplateArray = plcnext.getPrograms("/opt/plcnext/projects/PCWE/Plc/Meta/PCWE.meta.config");

// Create the set of program instances.
var nodeProgramArray = plcnext.getProgramInstances("/opt/plcnext/projects/PCWE/Plc/Plm/PCWE.acf.config", "/opt/plcnext/projects/PCWE/Plc/Esm/PCWE.esm.config");

// Create connections between programs.
var linkDataArray = plcnext.getConnections("/opt/plcnext/projects/PCWE/Plc/Gds/PCWE.gds.config");

// Write program connections back to the PLC.
plcnext.setConnections(linkDataArray, "/opt/plcnext/projects/PCWE/Plc/Gds/PCWE.gds.config")
  
```

## Motivation

This package includes functions for reading and writing information from PLCnext configuration files.  
These functions can be used to build node applications that run directly on the PLCnext platform.

## Installation

npm install plcnext

## API Reference

The schema definition for objects returned by functions are documented separately.

**getGlobalObjects ()**  
Returns an array of global objects from the PLC related to the eCLR, ESM, Axioline bus and Profinet interface.

**getIoModules (ticFileName)**  
Returns an array of IO modules configured in the TIC file.

**getProjects ()**  
Returns an array containing the names of all projects stored on the PLC.

**getPrograms (metaConfigFilename)**  
Returns an array of library/component/program definitions contained in the metadata configuration file.

**getProgramInstances (acfConfigFilename, esmConfigFilename)**  
Returns an array of component/program instances contained in the ACF and ESM configuration files.

**getConnections (gdsFileName)**  
Returns an array of connections contained in the GDS configuration file.
Connections may be between ports on program instances, I/O modules or global objects.

**setConnections (linkData, gdsFileName)**  
Writes the connections defined in linkData to the GDS configuration file.

## Tests

npm test

## Contributors

Please be kind.

## History

Version 0.1.0 (12-02-2018) - Initial commit.

## License

The MIT License (MIT)

Copyright (c) 2018 Martin Boers

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
