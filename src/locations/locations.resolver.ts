import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  Int,
} from "@nestjs/graphql";
import { LocationsService } from "./locations.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "../auth/gql-auth.guard";
import { GqlThrottlerGuard } from "../auth/gql-throttle.guard";

@Resolver("Location")
export class LocationsResolver {
  constructor(private locationsService: LocationsService) {}

  @UseGuards(GqlAuthGuard)
  @UseGuards(GqlThrottlerGuard)
  @Query(() => [LocationType])
  async favoriteLocations(@CurrentUser() user: { userId: number }) {
    return this.locationsService.findAllByUser(user.userId);
  }

  @UseGuards(GqlAuthGuard)
  @UseGuards(GqlThrottlerGuard)
  @Mutation(() => LocationType)
  async addFavoriteLocation(
    @Args("city") city: string,
    @CurrentUser() user: { userId: number }
  ) {
    return this.locationsService.create({ city }, user.userId);
  }

  @UseGuards(GqlAuthGuard)
  @UseGuards(GqlThrottlerGuard)
  @Mutation(() => Boolean)
  async removeFavoriteLocation(
    @Args("id", { type: () => Int }) id: number,
    @CurrentUser() user: { userId: number }
  ) {
    await this.locationsService.remove(id, user.userId);
    return true;
  }
}

@ObjectType()
class LocationType {
  @Field(() => Int)
  id: number;

  @Field()
  city: string;

  @Field(() => Int)
  userId: number;
}
