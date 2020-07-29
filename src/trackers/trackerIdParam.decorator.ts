import { SetMetadata } from '@nestjs/common';

export const TrackerIdParam = (param: string) => SetMetadata('trackerIdParam', param);
