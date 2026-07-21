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
import { MatchesService } from '../services/matches.service';
import { MatchDiscoveryService } from '../services/match-discovery.service';
import { PremiumMatchCuratorService } from '../services/premium-match-curator.service';
import { SendInterestDto } from '../dto/send-interest.dto';
import { RespondInterestDto } from '../dto/respond-interest.dto';
import { UnmatchDto } from '../dto/unmatch.dto';
import { MatchQueryDto, NearbyQueryDto } from '../dto/match-query.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly discoveryService: MatchDiscoveryService,
    private readonly curatorService: PremiumMatchCuratorService,
  ) {}

  //  Discovery

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

  //  My matches

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

  @Get('curated')
  async getCuratedMatches(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return successResponse(
      await this.curatorService.getCuratedMatches(req.user.sub, query),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  @Delete('curated/:curatedMatchId')
  @HttpCode(HttpStatus.OK)
  async dismissCuratedMatch(
    @Req() req: AuthenticatedRequest,
    @Param('curatedMatchId') curatedMatchId: string,
  ) {
    return successResponse(
      await this.curatorService.dismissCuratedMatch(
        req.user.sub,
        curatedMatchId,
      ),
      SuccessCode.MATCH_REMOVED,
    );
  }

  @Get('my')
  async getMyMatches(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return successResponse(
      await this.matchesService.getMyMatches(
        req.user.sub,
        query.page,
        query.limit,
      ),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  @Get('stats')
  async getMatchStats(@Req() req: AuthenticatedRequest) {
    return successResponse(
      await this.matchesService.getMatchStats(req.user.sub),
      SuccessCode.ANALYTICS_FETCHED,
    );
  }

  @Get('who-viewed-me')
  async getWhoViewedMe(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return successResponse(
      await this.matchesService.getWhoViewedMe(
        req.user.sub,
        query.page,
        query.limit,
      ),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  @Post('unmatch/:userId')
  @HttpCode(HttpStatus.OK)
  async unmatch(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body() dto: UnmatchDto,
  ) {
    return successResponse(
      await this.matchesService.unmatch(req.user.sub, userId, dto.reason),
      SuccessCode.MATCH_REMOVED,
    );
  }

  @Get('shortlisted')
  async getShortlistedProfiles(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return successResponse(
      await this.matchesService.getShortlistedProfiles(
        req.user.sub,
        query.page,
        query.limit,
      ),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  @Post('shortlist/:userId')
  @HttpCode(HttpStatus.OK)
  async shortlistProfile(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    return successResponse(
      await this.matchesService.shortlistProfile(req.user.sub, userId),
      SuccessCode.MATCH_SHORTLISTED,
    );
  }

  @Delete('shortlist/:userId')
  @HttpCode(HttpStatus.OK)
  async removeShortlistedProfile(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    return successResponse(
      await this.matchesService.removeShortlistedProfile(req.user.sub, userId),
      SuccessCode.MATCH_SHORTLIST_REMOVED,
    );
  }

  @Get('profile/:userId')
  async getMatchProfile(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    return successResponse(
      await this.matchesService.getMatchProfile(req.user.sub, userId),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  @Post('profile/:userId/contact')
  @HttpCode(HttpStatus.OK)
  async revealMatchContact(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    return successResponse(
      await this.matchesService.revealMatchContact(req.user.sub, userId),
      SuccessCode.MATCHES_FETCHED,
    );
  }

  //  Interests

  @Post('interest')
  @HttpCode(HttpStatus.CREATED)
  async sendInterest(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SendInterestDto,
  ) {
    return successResponse(
      await this.matchesService.sendInterest(req.user.sub, dto.receiverId),
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
      await this.matchesService.respondToInterest(
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
      await this.matchesService.withdrawInterest(req.user.sub, interestId),
      SuccessCode.INTEREST_WITHDRAWN,
    );
  }

  @Get('interests/received')
  async getReceivedInterests(
    @Req() req: AuthenticatedRequest,
    @Query() query: MatchQueryDto,
  ) {
    return successResponse(
      await this.matchesService.getReceivedInterests(
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
      await this.matchesService.getSentInterests(
        req.user.sub,
        query.page,
        query.limit,
      ),
      SuccessCode.MATCHES_FETCHED,
    );
  }
}
