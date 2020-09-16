import {Controller, Post, Req} from '@nestjs/common';
import {Request} from 'express';
import {DataService} from '../common/data.service';
import {TesteeService} from '../testee/testee.service';
import {WebsocketGateway} from '../common/websocket.gateway';


@Controller()
export class SystemController {

    constructor(
        private readonly dataService: DataService,
        private readonly testeeService: TesteeService,
        private readonly wsGateway: WebsocketGateway,
    ) {}

    @Post('/system/clean')
    clean(@Req() request: Request): void {
        this.wsGateway.disconnectAll();
        this.dataService.clean();
        this.testeeService.clean();
    }
}