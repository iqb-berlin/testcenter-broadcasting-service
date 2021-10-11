import { Test, TestingModule } from '@nestjs/testing';
import { Testee } from './testee.interface';
import { WebsocketGateway } from '../common/websocket.gateway';
import { Command } from '../command/command.interface';
import { TesteeService } from './testee.service';
import { HttpService } from '@nestjs/common';

let testeeService : TesteeService;

describe('testeeService add and remove', () => {
    const mockHTTPService = {
    };

    const mockTestee : Testee = {
        token: 'testeeToken',
        testId: 5,
        disconnectNotificationUri: "disconnectURI",
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TesteeService, WebsocketGateway, HttpService],
        }).overrideProvider(HttpService)
        .useValue(mockHTTPService)
        .compile();

        testeeService = module.get<TesteeService>(TesteeService);
    });
    
    it('should be defined', () => {
        expect(testeeService).toBeDefined();
    });

    it('should add a testee', () => {
        testeeService.addTestee(mockTestee);
        expect(testeeService['testees']['testeeToken']).toEqual(mockTestee);
    });

    it('should remove a testee', () => {
        const spyDisconnectClient = jest.spyOn(testeeService['websocketGateway'],'disconnectClient');
        const spyLogger = jest.spyOn(testeeService['logger'],'log');        

        testeeService.addTestee(mockTestee);
        testeeService.removeTestee(mockTestee.token);

        expect(testeeService['testees']['testeeToken']).toBeUndefined();
        expect(testeeService['testees']).toEqual({});
        expect(spyDisconnectClient).toHaveBeenCalled();
        expect(spyLogger).toHaveBeenCalled();
    });

    
});

describe('testeeService', () => {
    const mockHTTPService = {
        post: jest.fn(() => {
            const ret = {
                subscribe : () => {}
            }
            return ret;
        })
    };

    const mockTestee : Testee = {
        token: 'testeeToken',
        testId: 5,
        disconnectNotificationUri: "disconnectURI",
    };

    const mockTestee2 : Testee = {
        token: 'testeeToken2',
        testId: 6,
        disconnectNotificationUri: "disconnectURI",
    };

    const expectedTestees = [mockTestee, mockTestee2];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TesteeService, WebsocketGateway, HttpService],
        }).overrideProvider(HttpService)
        .useValue(mockHTTPService)
        .compile();

        testeeService = module.get<TesteeService>(TesteeService);
        testeeService.addTestee(mockTestee);
        testeeService.addTestee(mockTestee2);
    });

    it('should return an array of testees', () => {
        expect(testeeService.getTestees()).toEqual(expectedTestees);
    });

    it('should delete all testees', () => {
        
        testeeService.clean();
        expect(testeeService['testees']).toEqual({});
    });

    it('should broadcast commands to testees', () => {

        const mockCommand : Command = {
            keyword: 'pause',
            id : 'string id',
            arguments: ['arguments1', 'argument2'],
            timestamp: 12,
        };

        const testIds = [2, 3, 5, 19];
        const spyBroadcastToRegistered = jest.spyOn(testeeService['websocketGateway'],'broadcastToRegistered');
        expect(testeeService.broadcastCommandToTestees(mockCommand,testIds)).toBeUndefined();
        expect(spyBroadcastToRegistered).toHaveBeenCalled();
        expect(testeeService['websocketGateway']['broadcastToRegistered']).toHaveBeenCalled();
    });

    it('should return early (notifyDisconnection)', () => {
        const invalidTestee : Testee = {
            token: '',
            testId: 2,
            disconnectNotificationUri: 'disconnectURI'
        }
        expect(testeeService.notifyDisconnection(invalidTestee.token)).toBeUndefined();
    });

    it('should call http post (notifyDisconnection)', () => {
        testeeService.notifyDisconnection(mockTestee.token);
        expect(mockHTTPService.post).toHaveBeenCalledWith(testeeService['testees']['testeeToken'].disconnectNotificationUri);
    })

    it('should map testee with corresponding testIds to their respective tokens', () => {
        const testIds = [5,6,10,100, 0];

        testIds.forEach((testId => {
            if(testId == 5){
                expect(Object.values((testeeService['testees'])).filter(testee => testee.testId === testId).map(testee => testee.token))
                .toEqual(['testeeToken']);
            } else if(testId == 6){
                expect(Object.values((testeeService['testees'])).filter(testee => testee.testId === testId).map(testee => testee.token))
                .toEqual(['testeeToken2']);
            } else {
                expect(Object.values((testeeService['testees'])).filter(testee => testee.testId === testId).map(testee => testee.token))
                .toEqual([]);
            }
        }));
    });
});