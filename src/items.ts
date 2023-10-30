export interface Root {
    info: Info;
    item: Item[];
}

export interface Info {
    name: string;
    class: string;
    account: string;
    schc: string;
    status: string;
    ladder: string;
    title: string;
}

export interface Item {
    name_complete: NameComplete[];
    name: Name[];
    image: string;
    type: string;
    ilvl_original?: number;
    ilvl?: number;
    quality?: number;
    quality_str?: string;
    name_special?: NameSpecial[];
    completeDescription: CompleteDescription[];
    isEthereal: boolean;
    isRW: boolean;
    storage?: number;
    row?: number;
    column?: number;
    socketsNumber?: number;
    socketablesNumber?: number;
    isClassCharm?: boolean;
    isCharm?: boolean;
    hasTrophy?: boolean;
    isUpgraded?: boolean;
    width: number;
    height: number;
    equipment?: number;
    isTrophyFragment?: boolean;
    isEnhancedRW?: boolean;
    socketables?: Socketable[];
}

export interface NameComplete {
    text: string;
    color: number;
    addLineBreak: boolean;
}

export interface Name {
    text: string;
    color: number;
    addLineBreak: boolean;
}

export interface NameSpecial {
    text: string;
    color: number;
    addLineBreak: boolean;
}

export interface CompleteDescription {
    text: string;
    color: number;
    addLineBreak: boolean;
}

export interface Socketable {
    name_complete: NameComplete2[];
    name: Name2[];
    image: string;
    type: string;
    completeDescription: CompleteDescription2[];
    ilvl?: number;
    quality?: number;
    quality_str?: string;
}

export interface NameComplete2 {
    text: string;
    color: number;
    addLineBreak: boolean;
}

export interface Name2 {
    text: string;
    color: number;
    addLineBreak: boolean;
}

export interface CompleteDescription2 {
    text: string;
    color: number;
    addLineBreak: boolean;
}

export const cleanUpJson = (json: Root) => {
    return {
        ...json,
        item: (Array.isArray(json.item) ? json.item : [json.item]).map(
            (item) => {
                const keys = Object.keys(item);

                let massagedObj = keys.reduce((acc, next) => {
                    if (typeof item[next] === 'object') {
                        if ('part' in item[next]) {
                            acc[next] = Array.isArray(item[next].part)
                                ? item[next].part
                                : [item[next].part];
                        }
                        if ('socketables' === next) {
                            const socketables = (
                                Array.isArray((item[next] as any).item)
                                    ? ((item[next] as any)
                                          .item as any as Socketable[])
                                    : [
                                          (item[next] as any)
                                              .item as any as Socketable,
                                      ]
                            ).map<Socketable>((item) => {
                                const keys = Object.keys(item);

                                return keys.reduce((acc, next) => {
                                    if (
                                        typeof item[next] === 'object' &&
                                        'part' in item[next]
                                    ) {
                                        if ('part' in item[next]) {
                                            acc[next] = Array.isArray(
                                                item[next].part
                                            )
                                                ? item[next].part
                                                : [item[next].part];
                                        }
                                    } else {
                                        acc[next] = item[next];
                                    }
                                    return acc;
                                    //@ts-ignore
                                }, {}) as Socketable;
                            });
                            acc[next] = socketables;
                        }
                    } else {
                        if (/true|false/.test(item[next])) {
                            acc[next] = item[next] === true;
                        } else {
                            if (/^\d+$/.test(item[next])) {
                                acc[next] = Number.parseInt(item[next]);
                            } else {
                                acc[next] = item[next];
                            }
                        }
                    }
                    return acc;
                }, {}) as Item;

                return {
                    ...massagedObj,
                };
            }
        ),
    };
};
