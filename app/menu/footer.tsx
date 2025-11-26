import type { NoProps } from '../util';

export const Footer: React.FC<NoProps> = ({}) => {
    // TODO: GH & discord links
    return (
        <div className="footer">
            Tiny Shop &copy; 2021-2025 Tiny Cloud. Get the game{' '}
            <a href="https://play.google.com/store/apps/details?id=games.tinycloud.tinyshop">here from Google Play</a>{' '}
            or <a href="https://apps.apple.com/us/app/tiny-shop/id1579902294">here from the App Store</a>. This site is
            a fan-made and community-driven repository of data from the game. See GitHub for this site's source and the
            game's Discord for the community!
        </div>
    );
};
