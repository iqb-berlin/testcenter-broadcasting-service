import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { Request } from 'express';
import { TesteeController } from './testee.controller';
import { TesteeService } from './testee.service';
import { Testee } from './testee.interface';

let testeeController : TesteeController;

describe('TesteeController Post', () => {
  const mockTesteeService = {
    addTestee: jest.fn(),
    removeTestee: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TesteeController],
      providers: [TesteeService]
    }).overrideProvider(TesteeService).useValue(mockTesteeService).compile();

    testeeController = module.get<TesteeController>(TesteeController);
  });

  it('should be defined', () => {
    expect(testeeController).toBeDefined();
  });

  it('should throw not testee data', () => {
    const mockRequest = {
      body: {
        testId: 3
      }
    } as Request;

    expect(() => testeeController.testeeRegister(mockRequest)).toThrow(HttpException);
    expect(() => testeeController.testeeRegister(mockRequest)).toThrow('not testee data');
  });

  it('should not throw any errors (register)', () => {
    const mockRequest = {
      body: {
        token: 'token string',
        testId: 4,
        disconnectNotificationUri: 'testURI'
      }
    } as Request;

    expect(testeeController.testeeRegister(mockRequest)).toBeUndefined();
    expect(mockTesteeService.addTestee).toHaveBeenCalled();
  });

  it('should throw no token in body', () => {
    const mockRequest = {
      body: {
        name: 'not a token'
      }
    } as Request;

    expect(() => testeeController.testeeUnregister(mockRequest)).toThrow(HttpException);
    expect(() => testeeController.testeeUnregister(mockRequest)).toThrow('no token in body');
  });

  it('should not throw any errors (unregister)', () => {
    const mockRequest = {
      body: {
        token: 'token string',
        testId: 5,
        disconnectNotificationUri: 'testURI'
      }
    } as Request;

    expect(testeeController.testeeUnregister(mockRequest)).toBeUndefined();
    expect(mockTesteeService.removeTestee).toHaveBeenCalled();
  });
});

describe('testeeController Get', () => {
  const testee1 : Testee = {
    token: 'testee token1',
    testId: 4,
    disconnectNotificationUri: 'testURI'
  };

  const testee2 : Testee = {
    token: 'testee token2',
    testId: 4,
    disconnectNotificationUri: 'testURI'
  };

  const testee3 : Testee = {
    token: 'testee token3',
    testId: 6,
    disconnectNotificationUri: 'testURI'
  };

  const testeeList = [testee1, testee2, testee3];

  const mockTesteeService = {
    getTestees: jest.fn(() => testeeList)
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TesteeController],
      providers: [TesteeService]
    }).overrideProvider(TesteeService).useValue(mockTesteeService).compile();

    testeeController = module.get<TesteeController>(TesteeController);
  });

  it('should return a list of testees', () => {
    const mockRequest = {} as Request;

    expect(testeeController.testees(mockRequest)).toEqual(testeeList);
    expect(mockTesteeService.getTestees).toHaveBeenCalled();
  });
});
