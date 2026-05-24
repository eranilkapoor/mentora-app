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
import { SuccessCode } from 'src/common/constants';
import { successResponse } from 'src/common/utils/response.util';

@Controller('match')
@UseGuards(JwtAuthGuard)
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly discoveryService: MatchDiscoveryService,
  ) {}

  // ─── Discovery ─────────────────────────────────────────────────────────────

  @Get('recommended')
  async getRecommended(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return successResponse(
      await this.discoveryService.getRecommendedMatches(req.user.sub, query),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  @Get('new')
  async getNewMatches(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return successResponse(
      await this.discoveryService.getNewMatches(req.user.sub, query),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  @Get('nearby')
  async getNearbyMatches(
    @Req() req: AuthenticatedRequest,
    @Query() query: NearbyQueryDto,
  ) {
    return successResponse(
      await this.discoveryService.getNearbyMatches(req.user.sub, query),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  // ─── My matches ────────────────────────────────────────────────────────────

  @Get('online')
  async getOnlineMatches(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return successResponse(
      await this.discoveryService.getOnlineMatches(req.user.sub, query),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  @Get('my')
  async getMyMatches(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return successResponse(
      await this.matchService.getMyMatches(
        req.user.sub,
        query.page,
        query.limit,
      ),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  // ─── Interests ─────────────────────────────────────────────────────────────

  @Post('interest')
  @HttpCode(HttpStatus.CREATED)
  async sendInterest(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SendInterestDto,
  ) {
    return successResponse(
      await this.matchService.sendInterest(req.user.sub, dto.receiverId),
      SuccessCode.INTEREST_SENT,
    );
  }

  @Post('interest/respond')
  @HttpCode(HttpStatus.OK)
  async respondToInterest(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RespondInterestDto,
  ) {
    return successResponse(
      await this.matchService.respondToInterest(
        req.user.sub,
        dto.interestId,
        dto.action,
      ),
      dto.action === 'ACCEPT'
        ? SuccessCode.INTEREST_ACCEPTED
        : SuccessCode.INTEREST_REJECTED,
    );
  }

  @Delete('interest/:interestId')
  @HttpCode(HttpStatus.OK)
  async withdrawInterest(
    @Req() req: AuthenticatedRequest,
    @Param('interestId') interestId: string,
  ) {
    return successResponse(
      await this.matchService.withdrawInterest(req.user.sub, interestId),
      SuccessCode.INTEREST_WITHDRAWN,
    );
  }

  @Get('interests/received')
  async getReceivedInterests(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return successResponse(
      await this.matchService.getReceivedInterests(
        req.user.sub,
        query.page,
        query.limit,
      ),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  @Get('interests/sent')
  async getSentInterests(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return successResponse(
      await this.matchService.getSentInterests(
        req.user.sub,
        query.page,
        query.limit,
      ),
      SuccessCode.MATCHES_FETCHED,
    );
  }
}
