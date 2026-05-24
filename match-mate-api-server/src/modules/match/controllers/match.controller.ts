import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MatchService } from '../services/match.service';
import { MatchDiscoveryService } from '../services/match-discovery.service';
import { SendInterestDto } from '../dto/send-interest.dto';
import { RespondInterestDto } from '../dto/respond-interest.dto';
import { MatchQueryDto, NearbyQueryDto } from '../dto/match-query.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@Controller('match')
@UseGuards(JwtAuthGuard)
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly discoveryService: MatchDiscoveryService,
  ) {}

  // ─── Discovery ─────────────────────────────────────────────────────────────

  @Get('recommended')
  getRecommended(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return this.discoveryService.getRecommendedMatches(req.user.sub, query);
  }

  @Get('new')
  getNewMatches(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return this.discoveryService.getNewMatches(req.user.sub, query);
  }

  @Get('nearby')
  getNearbyMatches(
    @Req() req: AuthenticatedRequest,
    @Query() query: NearbyQueryDto,
  ) {
    return this.discoveryService.getNearbyMatches(req.user.sub, query);
  }

  // ─── My matches ────────────────────────────────────────────────────────────

  @Get('online')
  getOnlineMatches(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return this.discoveryService.getOnlineMatches(req.user.sub, query);
  }

  @Get('my')
  getMyMatches(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return this.matchService.getMyMatches(
      req.user.sub,
      query.page,
      query.limit,
    );
  }

  // ─── Interests ─────────────────────────────────────────────────────────────

  @Post('interest')
  @HttpCode(HttpStatus.CREATED)
  sendInterest(@Req() req: AuthenticatedRequest, @Body() dto: SendInterestDto) {
    return this.matchService.sendInterest(req.user.sub, dto.receiverId);
  }

  @Post('interest/respond')
  @HttpCode(HttpStatus.OK)
  respondToInterest(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RespondInterestDto,
  ) {
    return this.matchService.respondToInterest(
      req.user.sub,
      dto.interestId,
      dto.action,
    );
  }

  @Delete('interest/:interestId')
  @HttpCode(HttpStatus.OK)
  withdrawInterest(
    @Req() req: AuthenticatedRequest,
    @Param('interestId') interestId: string,
  ) {
    return this.matchService.withdrawInterest(req.user.sub, interestId);
  }

  @Get('interests/received')
  getReceivedInterests(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return this.matchService.getReceivedInterests(
      req.user.sub,
      query.page,
      query.limit,
    );
  }

  @Get('interests/sent')
  getSentInterests(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return this.matchService.getSentInterests(
      req.user.sub,
      query.page,
      query.limit,
    );
  }
}
