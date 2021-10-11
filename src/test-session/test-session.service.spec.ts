import { Test, TestingModule } from '@nestjs/testing';
import { TestSessionService } from './test-session.service';
import { SessionChange } from './session-change.interface';
import { Monitor } from '../monitor/monitor.interface';
import { WebsocketGateway } from '../common/websocket.gateway';

let testSessionService : TestSessionService;

const mockMonitor1 : Monitor = {
    token: 'monitorToken1',
    groups: ['Gruppe1', 'TestakerGroup1', 'Gruppe2']
}

const mockMonitor2 : Monitor = {
    token: 'monitorToken2',
    groups: ['Gruppe1', 'TestakerGroup1', 'Gruppe2']
}

const mockMonitor3 : Monitor = {
    token: 'monitorToken3',
    groups: ['Gruppe3', 'Gruppe5']
}

describe("TestSessionService: add and remove monitors", () => {

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TestSessionService, WebsocketGateway],
        }).compile();

        testSessionService = module.get<TestSessionService>(TestSessionService);
    
    });

    it('should be defined', () => {
        expect(testSessionService).toBeDefined();
    })

    it('should add monitors', () => {
        testSessionService.addMonitor(mockMonitor1);
        expect(testSessionService['monitors']['Gruppe1']['monitorToken1']).toEqual(mockMonitor1);
        expect(testSessionService['monitors']['TestakerGroup1']['monitorToken1']).toEqual(mockMonitor1);
        expect(testSessionService['monitors']['Gruppe2']['monitorToken1']).toEqual(mockMonitor1);
        expect(testSessionService['testSessions']['Gruppe1']).toEqual({});
        expect(testSessionService['testSessions']['TestakerGroup1']).toEqual({});
        expect(testSessionService['testSessions']['Gruppe2']).toEqual({});
    });

    it('should remove monitor (resulting in empty monitor list)', () => {
        const spyLogger = jest.spyOn(testSessionService['logger'],'log');
        const spyDisconnectClient = jest.spyOn(testSessionService['websocketGateway'],'disconnectClient');

        testSessionService.addMonitor(mockMonitor1);
        testSessionService.removeMonitor(mockMonitor1.token);

        expect(spyLogger).toHaveBeenCalled();
        expect(testSessionService['monitors']['Gruppe1']).toEqual({});
        expect(testSessionService['monitors']['TestakerGroup1']).toEqual({});
        expect(testSessionService['monitors']['Gruppe2']).toEqual({});
        
        expect(testSessionService['testSessions']['Gruppe1']).toBeUndefined();
        expect(testSessionService['testSessions']['TestakerGroup1']).toBeUndefined();
        expect(testSessionService['testSessions']['Gruppe2']).toBeUndefined();

        expect(spyDisconnectClient).toHaveBeenCalled();
    });

    it('should remove monitor (not empty monitor list)', () => {
        const spyLogger = jest.spyOn(testSessionService['logger'],'log');
        const spyDisconnectClient = jest.spyOn(testSessionService['websocketGateway'],'disconnectClient');
        
        testSessionService.addMonitor(mockMonitor1);
        testSessionService.addMonitor(mockMonitor2);
        testSessionService.removeMonitor(mockMonitor1.token);

        expect(spyLogger).toHaveBeenCalled();
        expect(testSessionService['monitors']['Gruppe1']['monitorToken1']).toBeUndefined();
        expect(testSessionService['monitors']['TestakerGroup1']['monitorToken1']).toBeUndefined();
        expect(testSessionService['monitors']['Gruppe2']['monitorToken1']).toBeUndefined();
        expect(testSessionService['monitors']['Gruppe1']['monitorToken2']).toEqual(mockMonitor2);
        expect(testSessionService['monitors']['TestakerGroup1']['monitorToken2']).toEqual(mockMonitor2);
        expect(testSessionService['monitors']['Gruppe2']['monitorToken2']).toEqual(mockMonitor2);
        
        expect(testSessionService['testSessions']['Gruppe1']).toEqual({})
        expect(testSessionService['testSessions']['TestakerGroup1']).toEqual({});
        expect(testSessionService['testSessions']['Gruppe2']).toEqual({});
        expect(spyDisconnectClient).toHaveBeenCalled();
    });

    it('should remove monitor (two distinct monitors)', () => {
        const spyLogger = jest.spyOn(testSessionService['logger'],'log');
        const spyDisconnectClient = jest.spyOn(testSessionService['websocketGateway'],'disconnectClient');

        testSessionService.addMonitor(mockMonitor1);
        testSessionService.addMonitor(mockMonitor3);
        testSessionService.removeMonitor(mockMonitor1.token);

        expect(spyLogger).toHaveBeenCalled();
        expect(testSessionService['monitors']['Gruppe1']['monitorToken1']).toBeUndefined();
        expect(testSessionService['monitors']['TestakerGroup1']['monitorToken1']).toBeUndefined();
        expect(testSessionService['monitors']['Gruppe2']['monitorToken1']).toBeUndefined();
        expect(testSessionService['monitors']['Gruppe3']['monitorToken3']).toEqual(mockMonitor3);
        expect(testSessionService['monitors']['Gruppe5']['monitorToken3']).toEqual(mockMonitor3);
        
        expect(testSessionService['testSessions']['Gruppe1']).toBeUndefined();
        expect(testSessionService['testSessions']['TestakerGroup1']).toBeUndefined();
        expect(testSessionService['testSessions']['Gruppe2']).toBeUndefined();
        expect(testSessionService['testSessions']['Gruppe3']).toEqual({});
        expect(testSessionService['testSessions']['Gruppe5']).toEqual({});
        expect(spyDisconnectClient).toHaveBeenCalled();
    });

    it('should call getClientTokens', () => {
        const spyGetClientTokens = jest.spyOn(testSessionService['websocketGateway'],'getClientTokens');
        testSessionService.getClientTokens();
        expect(spyGetClientTokens).toHaveBeenCalled();
    });

});

describe('testSessionService: get and clear all monitors', () => {

    const monitorList : Monitor[] = [mockMonitor1, mockMonitor2, mockMonitor3];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TestSessionService, WebsocketGateway],
        }).compile();

        testSessionService = module.get<TestSessionService>(TestSessionService);

        testSessionService.addMonitor(mockMonitor1);
        testSessionService.addMonitor(mockMonitor2);
        testSessionService.addMonitor(mockMonitor3);
    });

    it('should return all monitors', () => {
        expect(testSessionService.getMonitors()).toEqual(monitorList);
    });

    it('should clear all monitors and testSessions', () => {
        testSessionService.clean();
        expect(testSessionService['monitors']).toEqual({});
        expect(testSessionService['testSessions']).toEqual({});
    });
})

describe('testSessionService sessionChanges',() => {
    const mockSessionChange1 : SessionChange = {"personId":357,"groupName":"TestakerGroup1","testId":381,"groupLabel":"TestakerGroup1","mode":"run-hot-return","testState":{"CONTROLLER":"TERMINATED","CURRENT_UNIT_ID":"Endunit","TESTLETS_CLEARED_CODE":"[\"Examples\"]","FOCUS":"HAS","status":"locked"},"bookletName":"BOOKLET1","unitName":"Endunit","unitState":{"PLAYER":"RUNNING","RESPONSE_PROGRESS":"none","PRESENTATION_PROGRESS":"complete"},"timestamp":1630051624};
    const mockSessionChange1Updated : SessionChange = {"personId":357,"groupName":"TestakerGroup1","testId":381,"groupLabel":"TestakerGroup1","mode":"run-hot-return","testState":{"CONTROLLER":"TERMINATED","CURRENT_UNIT_ID":"Endunit","TESTLETS_CLEARED_CODE":"[\"Examples\"]","FOCUS":"HAS","status":"locked"},"bookletName":"BOOKLET1","unitName":"Testunit","unitState":{"PLAYER":"RUNNING","RESPONSE_PROGRESS":"none","PRESENTATION_PROGRESS":"complete"},"timestamp":1630051874};
    const mockSessionChangeNoMonitor : SessionChange = {"personId":9,"groupName":"Gruppe6","testId":10,"groupLabel":"Gruppe1","mode":"run-hot-return","testState":{"CONTROLLER":"TERMINATED","CURRENT_UNIT_ID":"FB_unit3","FOCUS":"HAS","status":"locked"},"bookletName":"BOOKLET_VERSION1","unitName":"FB_unit3","unitState":{"PLAYER":"RUNNING","PRESENTATION_PROGRESS":"complete","RESPONSE_PROGRESS":"some"},"timestamp":1630051624};
    const mockSessionChange2 : SessionChange = {"personId":6,"groupName":"Gruppe2","testId":7,"groupLabel":"Gruppe2","mode":"run-hot-return","testState":{"CONTROLLER":"TERMINATED","CURRENT_UNIT_ID":"FB_unit3","FOCUS":"HAS","status":"locked"},"bookletName":"BOOKLET_VERSION2","unitName":"FB_unit3","unitState":{"PLAYER":"RUNNING","PRESENTATION_PROGRESS":"complete","RESPONSE_PROGRESS":"some"},"timestamp":1630051624};
    const mockSessionChange3 : SessionChange = {"personId":7,"groupName":"Gruppe3","testId":8,"groupLabel":"Gruppe3","mode":"run-hot-return","testState":{"CONTROLLER":"TERMINATED","CURRENT_UNIT_ID":"FB_unit3","FOCUS":"HAS","status":"locked"},"bookletName":"BOOKLET_VERSION3","unitName":"FB_unit3","unitState":{"PLAYER":"RUNNING","PRESENTATION_PROGRESS":"complete","RESPONSE_PROGRESS":"some"},"timestamp":1630051624};
    const mockSessionChange5 : SessionChange = {"personId":16,"groupName":"Gruppe5","testId":17,"groupLabel":"Gruppe5","mode":"run-hot-return","testState":{"CONTROLLER":"TERMINATED","CURRENT_UNIT_ID":"FB_unit3","FOCUS":"HAS","status":"locked"},"bookletName":"BOOKLET_VERSION5","unitName":"FB_unit3","unitState":{"PLAYER":"RUNNING","PRESENTATION_PROGRESS":"complete","RESPONSE_PROGRESS":"some"},"timestamp":1630051624};


    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TestSessionService, WebsocketGateway],
        }).compile();

        testSessionService = module.get<TestSessionService>(TestSessionService);
        testSessionService.addMonitor(mockMonitor1);
        testSessionService.addMonitor(mockMonitor3);  
    });

    it('should return early (applySessioChange)', () => {
        testSessionService.applySessionChange(mockSessionChangeNoMonitor);
        expect(testSessionService['testSessions']['Testakergroup1']).toBeUndefined();
        expect(testSessionService['testSessions']['Gruppe2']).toEqual({});
        expect(testSessionService['testSessions']['Gruppe3']).toEqual({});
        expect(testSessionService['testSessions']['Gruppe5']).toEqual({});
        expect(testSessionService['testSessions']['Gruppe6']).toBeUndefined();
    });

    it('should create session entry', () => {
        testSessionService.applySessionChange(mockSessionChange1);
        expect(testSessionService['testSessions']['TestakerGroup1']['357|381']).toEqual(mockSessionChange1);
        expect(testSessionService['testSessions']['Gruppe2']).toEqual({});
        expect(testSessionService['testSessions']['Gruppe3']).toEqual({});
        expect(testSessionService['testSessions']['Gruppe5']).toEqual({});
    });

    it('should update a session entry', () => {
        testSessionService.applySessionChange(mockSessionChange1);  
        testSessionService.applySessionChange(mockSessionChange1Updated);

        expect(testSessionService['testSessions']['TestakerGroup1']['357|381']).toEqual(mockSessionChange1Updated);
        expect(testSessionService['testSessions']['Group1']).toBeUndefined();
        expect(testSessionService['testSessions']['Group2']).toBeUndefined();
        expect(testSessionService['testSessions']['Group3']).toBeUndefined();
        expect(testSessionService['testSessions']['Group5']).toBeUndefined();
    });

    it('should return an array of sessionChanges', () => {
        const expectedTestSessions : SessionChange[] = [mockSessionChange1, mockSessionChange2, mockSessionChange3, mockSessionChange5];

        testSessionService.applySessionChange(mockSessionChange1);
        testSessionService.applySessionChange(mockSessionChange2);
        testSessionService.applySessionChange(mockSessionChange3);
        testSessionService.applySessionChange(mockSessionChange5);
        expect(testSessionService.getTestSessions()).toEqual(expectedTestSessions);
    })
})