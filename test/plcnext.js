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
      expect(globalObjects).to.have.lengthOf(5);
    });
  });

  describe("Get IO Modules", function() {
    it("reads an IO configuration", function() {
      var io = plcnext.getIoModules("/opt/plcnext/projects/PCWE/Io/Arp.Io.AxlC/045f8bb5-cb6a-4982-8374-5636a44ad191.tic");
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

  describe("ESM configuration", function() {
    it("provides a complete ESM configuration", function() {
      var esmConfig = plcnext.getEsmConfig("/opt/plcnext/projects/PCWE/Plc/Esm/PCWE.esm.config",
      "/opt/plcnext/projects/PCWE/Plc/Plm/PCWE.acf.config");
      expect(esmConfig).to.be.an('array');
      expect(esmConfig).to.have.lengthOf(5);
      // TODO: Validate the JSON against a schema ... ?
    });
  });

  describe("Project program instances", function() {
    it("lists all program instances in a project, including the task they're assigned to", function() {
      var programInstances = plcnext.getProgramInstances("/opt/plcnext/projects/PCWE/Plc/Plm/PCWE.acf.config", "/opt/plcnext/projects/PCWE/Plc/Esm/PCWE.esm.config");
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