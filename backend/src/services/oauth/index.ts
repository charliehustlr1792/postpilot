import { Platform } from "../../types/enums";
import { OAuthProvider } from "./types";
import { twitterProvider } from "./twitter";
import { linkedinProvider } from "./linkedin";
import { facebookProvider, instagramProvider } from "./meta";

export { getProviderConfig } from "./providers";
export { exchangeAuthorizationCode } from "./exchange";

const PROVIDERS: Record<Platform, OAuthProvider> = {
    [Platform.TWITTER]: twitterProvider,
    [Platform.LINKEDIN]: linkedinProvider,
    [Platform.FACEBOOK]: facebookProvider,
    [Platform.INSTAGRAM]: instagramProvider,
};

export function getOAuthProvider(platform: Platform): OAuthProvider {
    return PROVIDERS[platform];
}
