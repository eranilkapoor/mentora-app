import { Controller, Post, Body, Get } from '@nestjs/common';
import { MatchService } from './match.service';
import { SendInterestDto } from './dto/send-interest.dto';
import { RespondInterestDto } from './dto/respond-interest.dto';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  // TEMP: replace with @Req user later
  private getUserId(): string {
    return 'USER_ID_FROM_AUTH';
  }

  @Post('interest')
  sendInterest(@Body() dto: SendInterestDto) {
    return this.matchService.sendInterest(this.getUserId(), dto.receiverId);
  }

  @Post('respond')
  respond(@Body() dto: RespondInterestDto) {
    return this.matchService.respondToInterest(
      this.getUserId(),
      dto.interestId,
      dto.action,
    );
  }

  @Get('my')
  getMyMatches() {
    return this.matchService.getMyMatches(this.getUserId());
  }
}
