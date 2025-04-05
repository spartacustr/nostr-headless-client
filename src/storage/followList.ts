const FollowList: Record<string, string[]> = {};

export const saveFollowList = ({ author, keys }: { author: string; keys: string[]}) => {
    FollowList[author] = keys;
    return FollowList[author]
}
