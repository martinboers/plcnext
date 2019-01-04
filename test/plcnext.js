var expect = require("chai").expect;
var plcnext = require("../plcnext");

describe("PC Worx Integrator", function() {
  it("is an object", function(){
    expect(plcnext).to.be.an('object');
  });
  it("has a getGlobalObjects method", function(){
    expect(plcnext.getGlobalObjects).to.be.a('function');
  });
  it("has a getIoModules method", function(){
    expect(plcnext.getIoModules).to.be.a('function');
  });
  it("has a readLibmeta method", function(){
    expect(plcnext.readLibmeta).to.be.a('function');
  });
  it("has a readTypemeta method", function(){
    expect(plcnext.readTypemeta).to.be.a('function');
  });
  it("has a readCompmeta method", function(){
    expect(plcnext.readCompmeta).to.be.a('function');
  });
  it("has a readProgmeta method", function(){
    expect(plcnext.readProgmeta).to.be.a('function');
  });
  it("has a readEsmConfig method", function(){
    expect(plcnext.readEsmConfig).to.be.a('function');
  });
  it("has a readGdsConfig method", function(){
    expect(plcnext.readGdsConfig).to.be.a('function');
  });
  it("has a getPrograms method", function(){
    expect(plcnext.getPrograms).to.be.a('function');
  });
  it("has a getEsmConfig method", function(){
    expect(plcnext.getEsmConfig).to.be.a('function');
  });
  it("has a getProgramInstances method", function(){
    expect(plcnext.getProgramInstances).to.be.a('function');
  });
  it("has a getConnections method", function(){
    expect(plcnext.getConnections).to.be.a('function');
  });

  describe("Get Global Objects", function() {
    it("returns all the global objects available on the PLC", function() {
      var globalObjects = plcnext.getGlobalObjects();
      expect(globalObjects).to.be.an('array');
      expect(globalObjects).to.have.lengthOf(8);
    });
  });

  describe("Get IO Modules", function() {
    it("reads an IO configuration", function() {
      var io = plcnext.getIoModules("/opt/plcnext/projects/PCWE/Io/Arp.Io.AxlC/da97d46e-6f09-49c7-8861-3da972c388b7.tic");
      expect(io).to.be.an('array');
      expect(io).to.have.lengthOf(1);
      expect(io[0].leftArray).to.be.an('array');
      expect(io[0].leftArray).to.have.lengthOf(9);
      expect(io[0].rightArray).to.be.an('array');
      expect(io[0].rightArray).to.have.lengthOf(9);
    });
  });

  describe("Project programs", function() {
    it("describes the interface of all the programs in a project", function() {
      var programs = plcnext.getPrograms("/opt/plcnext/projects/PCWE/Plc/Meta/PCWE.meta.config");
      expect(programs).to.be.an('array');
      expect(programs).to.have.lengthOf(1);
      // TODO: Validate the JSON against a schema ... ?
    });
  });

  describe("Read libmeta", function() {
    it("reads library metadata and returns it in JSON", function() {
      var libmeta = plcnext.readLibmeta("/opt/plcnext/projects/PCWE/Libs/Pxc.Tcs.MyProject/Pxc.Tcs.MyProject.libmeta");
      expect(libmeta).to.be.an('array');
      expect(libmeta).to.have.lengthOf(1);
    });
  });

  describe("Read typemeta", function() {
    it("reads type metadata and returns it in JSON", function() {
      var typemeta = plcnext.readTypemeta("/opt/plcnext/projects/PCWE/Libs/Pxc.Tcs.MyProject/Pxc.Tcs.MyProject.typemeta");
      expect(typemeta).to.be.an('array');
      expect(typemeta).to.have.lengthOf(0);
    });
  });

  describe("Read compmeta", function() {
    it("reads component metadata and returns it in JSON", function() {
      var compmeta = plcnext.readCompmeta("/opt/plcnext/projects/PCWE/Libs/Pxc.Tcs.MyProject/MyProjectComponent/MyProjectComponent.compmeta");
      expect(compmeta).to.be.an('array');
      expect(compmeta).to.have.lengthOf(1);
    });
  });

  describe("Read progmeta", function() {
    it("reads program metadata and returns it in JSON", function() {
      var progmeta = plcnext.readProgmeta("/opt/plcnext/projects/PCWE/Libs/Pxc.Tcs.MyProject/MyProjectComponent/MyProjectProgram/MyProjectProgram.progmeta");
      expect(progmeta).to.be.an('array');
      expect(progmeta).to.have.lengthOf(1);
    });
  });

  describe("Read ESM configuration", function() {
    it("reads ESM configuration and returns it in JSON", function() {
      var esmconfig = plcnext.readEsmConfig("/opt/plcnext/projects/PCWE/Plc/Esm/PCWE.esm.config");
      expect(esmconfig).to.be.an('object');
      expect(esmconfig.CyclicTasks).to.be.an('array');
      expect(esmconfig.CyclicTasks).to.have.lengthOf(1);
    });
  });

  describe("Read GDS configuration", function() {
    it("reads GDS configuration and returns it in JSON", function() {
      var gdsconfig = plcnext.readGdsConfig("/opt/plcnext/projects/PCWE/Plc/Gds/PCWE.gds.config");
      expect(gdsconfig).to.be.an('object');
      expect(gdsconfig.Connectors).to.be.an('array');
      expect(gdsconfig.Connectors).to.have.lengthOf(57);
    });
  });

  describe("ESM configuration", function() {
    it("provides a complete ESM configuration", function() {
      var esmConfig = plcnext.getEsmConfig("/opt/plcnext/projects/PCWE/Plc/Esm/PCWE.esm.config",
      "/opt/plcnext/projects/PCWE/Plc/Plm/pcwe.plm.config");
      expect(esmConfig).to.be.an('array');
      expect(esmConfig).to.have.lengthOf(5);
      // TODO: Validate the JSON against a schema ... ?
    });
  });

  describe("Project program instances", function() {
    it("lists all program instances in a project, including the task they're assigned to", function() {
      var programInstances = plcnext.getProgramInstances("/opt/plcnext/projects/PCWE/Plc/Plm/pcwe.plm.config", "/opt/plcnext/projects/PCWE/Plc/Esm/PCWE.esm.config");
      expect(programInstances).to.be.an('array');
      expect(programInstances).to.have.lengthOf(1);
      // TODO: Validate the JSON against a schema ... ?
    });
  });

  describe("Project program connections", function() {
    it("describes connections between program instances", function() {
      var connections = plcnext.getConnections("/opt/plcnext/projects/PCWE/Plc/Gds/PCWE.gds.config");
      expect(connections).to.be.an('array');
      expect(connections).to.have.lengthOf(65);
    });
  });
});