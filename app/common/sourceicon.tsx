import { BsCashCoin, BsExclamationCircle, BsQuestionSquareFill } from 'react-icons/bs';
import { FaCheck, FaOctopusDeploy, FaRegStar, FaShieldAlt, FaShoppingBasket } from 'react-icons/fa';
import { FaTreeCity } from 'react-icons/fa6';
import { GiOpenChest, GiRaccoonHead } from 'react-icons/gi';
import { LiaLevelUpAltSolid } from 'react-icons/lia';
import { LuGem, LuScrollText, LuSword } from 'react-icons/lu';
import { PiPlant } from 'react-icons/pi';
import { TbPuzzle2 } from 'react-icons/tb';
import { SourceType } from '../database/sources';

interface SourceIconProps {
    readonly type: SourceType;
    readonly extraClasses?: string;
}

export const SourceTypeIcon: React.FC<SourceIconProps> = ({ type, extraClasses }) => {
    let IconChoice;
    switch (type) {
        case SourceType.Battle:
            IconChoice = LuSword;
            break;
        case SourceType.Boutique:
            IconChoice = LuGem;
            break;
        case SourceType.City:
            IconChoice = FaTreeCity;
            break;
        case SourceType.Combine:
            IconChoice = TbPuzzle2;
            break;
        case SourceType.EventMarket:
            IconChoice = FaShoppingBasket;
            break;
        case SourceType.Feat:
            IconChoice = FaRegStar;
            break;
        case SourceType.Harvest:
            IconChoice = PiPlant;
            break;
        case SourceType.Journey:
            IconChoice = BsExclamationCircle;
            break;
        case SourceType.Market:
            IconChoice = FaShieldAlt;
            break;
        case SourceType.MissionReward:
            IconChoice = LuScrollText;
            break;
        case SourceType.Outpost:
            IconChoice = FaOctopusDeploy;
            break;
        case SourceType.PremiumPack:
            IconChoice = BsCashCoin;
            break;
        case SourceType.Shifty:
            IconChoice = GiRaccoonHead;
            break;
        case SourceType.ShopLevel:
            IconChoice = LiaLevelUpAltSolid;
            break;
        case SourceType.Task:
            IconChoice = FaCheck;
            break;
        case SourceType.TaskChest:
            IconChoice = GiOpenChest;
            break;
        default:
            IconChoice = BsQuestionSquareFill;
            break;
    }
    return <IconChoice className={'source-icon ' + (extraClasses || '')} />;
};
