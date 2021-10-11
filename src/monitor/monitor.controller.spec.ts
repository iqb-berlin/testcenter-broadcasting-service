import { Test, TestingModule } from '@nestjs/testing';
import { MonitorController } from './monitor.controller'
import { TestSessionService } from '../test-session/test-session.service';
import { Monitor } from './monitor.interface';
import { Request } from 'express';
import { HttpException } from '@nestjs/common';

describe('MonitorController Post Register', () => {
    let monitorController: MonitorController;

    const mockTestSessionservice = {
        addMonitor: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MonitorController],
            providers: [TestSessionService],
        }).overrideProvider(TestSessionService).useValue(mockTestSessionservice).compile();

        monitorController = module.get<MonitorController>(MonitorController);
    });

    it('should be defined', () => {
        expect(monitorController).toBeDefined();
    });

    it('should throw not monitor data', () => {
        const mockNotMonitorRequest = {
            body : {
                name: 'Testname'
            }
        } as Request;

        expect(() => monitorController.monitorRegister(mockNotMonitorRequest)).toThrow(HttpException);
        expect(() => monitorController.monitorRegister(mockNotMonitorRequest)).toThrow('not monitor data');
    });

    it('should throw not monitor data', () => {
        const mockNoTokenRequest = { 
            body : {
                groups : ['group string 1','group string 2']
            }
        } as Request;

        expect(() => monitorController.monitorRegister(mockNoTokenRequest)).toThrow(HttpException);
        expect(() => monitorController.monitorRegister(mockNoTokenRequest)).toThrow('not monitor data');
    });

    it('should not throw any errors', () => {
        const logger = jest.spyOn(monitorController['logger'],'log');
        const mockMonitor : Monitor = {
            token: "token string",
            groups: ['group string 1', 'group string 2']
        }
        const mockRequest = {
            body : mockMonitor
        } as Request;

        expect(monitorController.monitorRegister(mockRequest)).toBeUndefined();
        expect(logger).toHaveBeenCalled();
        expect(mockTestSessionservice.addMonitor).toHaveBeenCalled();
    });
    
});

describe('monitorController Post Unregister', () => {
    let monitorController: MonitorController;

    const mockTestSessionservice = {
        removeMonitor: jest.fn()
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MonitorController],
            providers: [TestSessionService],
        }).overrideProvider(TestSessionService).useValue(mockTestSessionservice).compile();

        monitorController = module.get<MonitorController>(MonitorController);
    });

    it('should throw no token in body', () => {
        const mockRequest = {
            body : {
                name : "name"
            }
        } as Request;

        expect(() => monitorController.monitorUnregister(mockRequest)).toThrow(HttpException);
        expect(() => monitorController.monitorUnregister(mockRequest)).toThrow('no token in body');
    });

    it('should not throw any errors', () => {
        const logger = jest.spyOn(monitorController['logger'],'log');
        const mockRequest = {
            body : {
                token: 'token string'
            }
        } as Request;
        
        expect(monitorController.monitorUnregister(mockRequest)).toBeUndefined();
        expect(logger).toHaveBeenCalled();
        expect(mockTestSessionservice.removeMonitor).toHaveBeenCalled();
    })
});

describe('monitorController Get', () => {
    let monitorController: MonitorController;

    const monitor1 : Monitor = {
        token: 'token string1',
        groups: ["group string"]
    }
    const monitor2 : Monitor = {
        token: 'token string2',
        groups: ["group string"]
    }
    const mockMonitorList = [monitor1, monitor2];

    const mockTokenList = ['first token','second token'];

    const mockTestSessionservice = {
        getMonitors: jest.fn(() => {
            return mockMonitorList;
        }),
        getClientTokens: jest.fn(() => {
            return mockTokenList;
        }),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MonitorController],
            providers: [TestSessionService],
        }).overrideProvider(TestSessionService).useValue(mockTestSessionservice).compile();

        monitorController = module.get<MonitorController>(MonitorController);
    });

    it('should return a monitor list', () => {
        const mockRequest = {} as Request;

        expect(monitorController.monitors(mockRequest)).toEqual(mockMonitorList);
        expect(mockTestSessionservice.getMonitors).toHaveBeenCalled();
    });

    it('should return a client token list', () => {
        const mockRequest = {} as Request;

        expect(monitorController.clients(mockRequest)).toEqual(mockTokenList);
        expect(mockTestSessionservice.getClientTokens).toHaveBeenCalled();
    });
})