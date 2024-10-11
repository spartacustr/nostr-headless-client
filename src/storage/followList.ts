const FollowList = {};

export const saveFollowList = ({ author, keys }: { author: string; keys: string[]}) => {
    FollowList[author] = keys;
    return FollowList[author]
}
