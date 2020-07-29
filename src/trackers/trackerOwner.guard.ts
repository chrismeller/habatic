import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TrackersService } from './trackers.service';

@Injectable()
export class TrackerOwnerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly trackersService: TrackersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const trackerIdParam = this.reflector.get<string>('trackerIdParam', context.getHandler());
    if (!trackerIdParam) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // if we can't find the ID we need or there isn't one
    if (!request.params.hasOwnProperty(trackerIdParam) || request[trackerIdParam] === '') {
      return false;
    }

    const trackerId = request.params[trackerIdParam];

    if (!trackerId) {
      return false;
    }

    const tracker = await this.trackersService.getById(trackerId);

    if (!tracker) {
      return false;
    }

    return request.user.id === tracker.userId;
  }
}
