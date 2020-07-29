import { Controller, Post, Get, Request, Body, Param, UseGuards, Delete, Res, Put, UseInterceptors } from '@nestjs/common';
import { CreateTrackerDto } from './dtos/create-tracker.dto';
import { TrackersService } from './trackers.service';
import { Tracker } from './interfaces/tracker.interface';
import * as uuid from 'uuid';
import { AuthGuard } from '@nestjs/passport';
import { TrackerOwnerGuard } from './trackerOwner.guard';
import { TrackerIdParam } from './trackerIdParam.decorator';
import { AuditInterceptor } from '../audit/audit.interceptor';
import { AuditMessage } from '../audit/auditMessage.decorator';

@Controller('trackers')
export class TrackersController {
  constructor(private readonly trackersService: TrackersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(AuditInterceptor)
  @AuditMessage('Tracker ${req.body.name} created by ${req.user.id}')
  async create(@Request() req, @Res() res, @Body() createTrackerDto: CreateTrackerDto) {
    const id = uuid.v4();
    const tracker: Tracker = {
      id,
      type: 'check',
      createdAt: new Date().toISOString(),
      name: createTrackerDto.name,
      userId: req.user.id,
    };

    await this.trackersService.create(tracker);

    // @todo return the ID of the new tracker somehow so we can provide a 'go to new tracker' link
    return res.status(201).send({ id });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async get(@Request() req) {
    return await this.trackersService.getForUser(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), TrackerOwnerGuard)
  @TrackerIdParam('id')
  @UseInterceptors(AuditInterceptor)
  @AuditMessage('Tracker ${req.params.id} deleted by ${req.user.id}')
  @Delete('/:id')
  async delete(@Request() req, @Res() res, @Param('id') id: string) {
    const tracker = await this.trackersService.getById(id);

    if (!tracker) {
      return res.status(404).send();
    }

    await this.trackersService.delete(id);

    return res.status(204).send();
  }

  @UseGuards(AuthGuard('jwt'), TrackerOwnerGuard)
  @TrackerIdParam('id')
  @UseInterceptors(AuditInterceptor)
  @AuditMessage('Tracker ${req.params.name} (${req.params.id}) updated by ${req.user.id}')
  @Put('/:id')
  async update(@Request() req, @Res() res, @Param('id') id: string, @Body() updateTrackerDto: CreateTrackerDto) {
    const existingTracker = await this.trackersService.getById(id);

    if (!existingTracker) {
      return res.status(404).send();
    }

    const tracker: Tracker = {
      id: existingTracker.id,
      userId: existingTracker.userId,
      type: existingTracker.type,
      createdAt: existingTracker.createdAt,
      // finally, the only property they can update right now
      name: updateTrackerDto.name,
    };

    await this.trackersService.update(tracker);

    return res.status(202).send();
  }
}
