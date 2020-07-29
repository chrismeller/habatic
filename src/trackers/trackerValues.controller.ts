import { Controller, Post, Get, Request, Body, Param, UseGuards, Delete, Res, Put, UseInterceptors } from '@nestjs/common';
import { TrackersService } from './trackers.service';
import * as uuid from 'uuid';
import { AuthGuard } from '@nestjs/passport';
import { CreateTrackerValueDto } from './dtos/create-tracker-value.dto';
import { UpdateTrackerValueDto } from './dtos/update-tracker-value.dto';
import { TrackerValuesService } from './trackerValues.service';
import { TrackerValue } from './interfaces/trackerValue.interface';
import { TrackerOwnerGuard } from './trackerOwner.guard';
import { TrackerIdParam } from './trackerIdParam.decorator';
import { AuditInterceptor } from '../audit/audit.interceptor';
import { AuditMessage } from '../audit/auditMessage.decorator';

@Controller('trackers')
export class TrackersController {
  constructor(private readonly trackersService: TrackersService, private readonly trackerValuesService: TrackerValuesService) {}

  @UseGuards(AuthGuard('jwt'), TrackerOwnerGuard)
  @TrackerIdParam('trackerId')
  @UseInterceptors(AuditInterceptor)
  @AuditMessage('Tracker ${req.params.id} value created by ${req.user.id}')
  @Post('/:trackerId')
  async create(@Request() req, @Res() res, @Param('trackerId') trackerId: string, @Body() createTrackerValueDto: CreateTrackerValueDto) {
    const tracker = await this.trackersService.getById(trackerId);

    if (!tracker) {
      return res.status(404).send();
    }

    const value: TrackerValue = {
      id: uuid.v4(),
      trackerId: tracker.id,
      trackerUserId: tracker.userId,
      valueDate: createTrackerValueDto.valueDate,
      value: createTrackerValueDto.value,
      createdAt: new Date().toISOString(),
    };

    await this.trackerValuesService.create(value);

    return res.status(204).send();
  }

  @UseGuards(AuthGuard('jwt'), TrackerOwnerGuard)
  @TrackerIdParam('trackerId')
  @UseInterceptors(AuditInterceptor)
  @AuditMessage('Tracker ${req.params.id} value updated by ${req.user.id}')
  @Put('/:trackerId/:trackerValueId')
  async update(@Request() req, @Res() res,
               @Param('trackerId') trackerId: string,
               @Param('trackerValueId') trackerValueId: string,
               @Body() updateTrackerValueDto: UpdateTrackerValueDto) {
      const existingValue = await this.trackerValuesService.getById(trackerValueId);

      if (!existingValue) {
        return res.status(404).send();
      }

      const value: TrackerValue = {
        id: existingValue.id,
        trackerId: existingValue.trackerId,
        trackerUserId: existingValue.trackerUserId,
        createdAt: existingValue.createdAt,
        valueDate: existingValue.valueDate,
        // the only things that can be updated now
        value: updateTrackerValueDto.value,
        updatedAt: new Date().toISOString(),
      };

      await this.trackerValuesService.update(value);

      return res.status(202).send();
  }

  @UseGuards(AuthGuard('jwt'), TrackerOwnerGuard)
  @TrackerIdParam('trackerId')
  @UseInterceptors(AuditInterceptor)
  @AuditMessage('Tracker ${req.params.id} value deleted by ${req.user.id}')
  @Delete('/:trackerId/:trackerValueId')
  async delete(@Request() req, @Res() res, @Param('trackerId') trackerId: string, @Param('trackerValueId') trackerValueId: string) {
    const existingValue = await this.trackerValuesService.getById(trackerValueId);

    if (!existingValue) {
      return res.status(404).send();
    }

    await this.trackerValuesService.delete(existingValue.id);

    return res.status(202).send();
  }
}
