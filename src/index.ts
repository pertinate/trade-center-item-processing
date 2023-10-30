import { Root, cleanUpJson, CompleteDescription } from './items';
import prisma from './prisma';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

let data = 0;

export const getItemLocation = (storage: number) => {
    switch (storage) {
        case 1:
            return 'Inventory';
        case 2:
            return 'Belt';
        case 4:
            return 'Cube';
        case 5:
            return 'Stash';
        default:
            return 'Equipment';
    }
};

const pull = new Date();

const basePath = path.resolve('./src/char_data');

const inputArray = fs
    .readdirSync(basePath)
    .filter((fileName) => fs.lstatSync(`./src/char_data/${fileName}`).isFile());

const inputItems = inputArray.map(
    (fileName) =>
        cleanUpJson(
            JSON.parse(fs.readFileSync(`./src/char_data/${fileName}`, 'utf-8'))
        ) as Root
);

console.time('total');
const numNames = ['One', 'Two', 'Three', 'Four', 'Five'];

const processItems = async (items: Root[]) => {
    console.log('fixing chars');
    const fixedCharacters = items.map((entry) => {
        return {
            ...entry,
            item: entry.item
                .map((item) => {
                    return {
                        ...item,
                        name: item.name.map((entry) => ({
                            text: entry.text,
                            color: Number(entry.color),
                            addLineBreak: (entry.addLineBreak as any) == 'true',
                        })),
                        name_complete: item.name_complete.map((entry) => ({
                            text: entry.text,
                            color: Number(entry.color),
                            addLineBreak: (entry.addLineBreak as any) == 'true',
                        })),
                        name_special: item.name_special?.map((entry) => ({
                            text: entry.text,
                            color: Number(entry.color),
                            addLineBreak: (entry.addLineBreak as any) == 'true',
                        })),
                        completeDescription: (/(hp[0-9])/.test(item.type)
                            ? item.completeDescription.map((entry) => ({
                                  ...entry,
                                  text: entry.text.replace('15 000', '15000'),
                              }))
                            : item.completeDescription).map(
                            (roll) => {
                                try {
                                    const rollMatch =
                                        roll.text?.matchAll(/(\d+)/g);
                                    const captured = [];

                                    for (const [value] of rollMatch)
                                        captured.push(Number(value));
                                    return {
                                        text: roll.text,
                                        color: Number(roll.color),
                                        addLineBreak:
                                            (roll.addLineBreak as any) ==
                                            'true',
                                        values: captured,
                                        genericRollText: roll.text.replace(
                                            /\d+/g,
                                            '<#>'
                                        ),
                                    };
                                } catch {
                                    return {
                                        text: roll.text,
                                        color: Number(roll.color),
                                        addLineBreak:
                                            (roll.addLineBreak as any) ==
                                            'true',
                                    };
                                }
                            }
                        ),
                    };
                })
        };
    });

    const allGenerics = Array.from(
        new Set(
            fixedCharacters
                .map((entry) =>
                    entry.item.map((item) => {
                        const forbiddenDescriptions = [
                            ...item.name,
                            ...item.name_complete,
                        ];

                        return item.completeDescription
                            .filter(
                                (entry) =>
                                    forbiddenDescriptions.findIndex(
                                        (desc) => desc.text !== entry.text
                                    ) > -1
                            )
                            .reduce<string[]>(
                                (acc, desc) => {
                                    acc[acc.length - 1] += desc.genericRollText;

                                    if (desc.addLineBreak) {
                                        acc.push('');
                                    }

                                    return acc;
                                },
                                ['']
                            );
                    })
                )
                .flat(2)
        )
    ).filter((entry) => !!entry);

    console.log(allGenerics);

    await prisma.genericRolls.createMany({
        data: allGenerics.map((roll) => ({ roll })),
        skipDuplicates: true,
    });

    const accounts = Array.from(
        new Set(fixedCharacters.map((entry) => entry.info.account))
    );

    await prisma.tSWAccount.createMany({
        data: accounts.map((account) => ({ account })),
        skipDuplicates: true,
    });

    const run = async (timer: string) => {
        const char = fixedCharacters.pop();

        if (!char) {
            console.timeEnd(timer);
            return;
        }
        console.log(`creating ${char.info.name} and ${char.item.length} items`);

        const character = await prisma.characters.upsert({
            create: {
                name: char.info.name,
                title: char.info.title ?? '',
                account: char.info.account,
                schc: char.info.schc,
                status: char.info.status,
                ladder: char.info.ladder,
            },
            update: {
                title: char.info.title ?? '',
                schc: char.info.schc,
                status: char.info.status,
                ladder: char.info.ladder,
            },
            where: {
                name: char.info.name,
            },
        });
        data += char.item.length;

        //need to check if items already exist, if so then update

        await prisma.items.createMany({
            data: char.item.map((item) => {
                const location = getItemLocation(item.storage);
                
                return {
                    id: `${char.info.account}.${char.info.name}.${
                        item.storage || -1
                    }.${
                        location == 'Equipment'
                            ? `e.${item.equipment || -1}`
                            : `i.${item.column}.${item.row}`
                    }`,
                    characterId: character.name,
                    image: item.image,
                    type: item.type.toString(),
                    ilvl: item.ilvl,
                    ilvl_original: item.ilvl_original,
                    quality: item.quality,
                    quality_str: item.quality_str,
                    is_ethereal: item.isEthereal,
                    is_rw: item.isRW,
                    storage: item.storage,
                    socket_count: item.socketsNumber,
                    socketed_count: item.socketablesNumber,
                    is_class_charm: item.isClassCharm,
                    is_charm: item.isCharm,
                    has_trophy: item.hasTrophy,
                    is_upgraded: item.isUpgraded,
                    equipment: item.equipment,
                    is_trophy_fragment: item.isTrophyFragment,
                    is_enhanced_rw: item.isEnhancedRW,
                    pull_ts: pull,
                    complete_description: JSON.stringify(
                        item.completeDescription
                    ),
                    name_idxs: item.name
                        .map((entry) =>
                            item.completeDescription.findIndex(
                                (desc) => desc.text == entry.text
                            )
                        )
                        .join(','),
                    name_complete_idxs: item.name_complete
                        .map((entry) =>
                            item.completeDescription.findIndex(
                                (desc) => desc.text == entry.text
                            )
                        )
                        .join(','),
                    name_special_idxs: item?.name_special
                        ?.map((entry) =>
                            item.completeDescription.findIndex(
                                (desc) => desc.text == entry.text
                            )
                        )
                        .join(','),
                };
            }),
            skipDuplicates: true,
        });

        try {
            await prisma.complete_Description.createMany({
                data: char.item
                    .map((item) =>
                        item.completeDescription.map((desc) => {
                            const location = getItemLocation(item.storage);
                            
                            return {
                                itemId: `${char.info.account}.${
                                    char.info.name
                                }.${item.storage || -1}.${
                                    location == 'Equipment'
                                        ? `e.${item.equipment || -1}`
                                        : `i.${item.column}.${item.row}`
                                }`,
                                ...desc,
                                text: desc.text.toString(),
                                values: undefined,
                                ...(desc.values || []).reduce<
                                    Record<string, number>
                                >((acc, next, idx) => {
                                    acc[`values${numNames[idx]}`] = next;
                                    return acc;
                                }, {}),
                            };
                        })
                    )
                    .flat(),
                skipDuplicates: true,
            });
        } catch (error) {
            console.error(`>>>`, error);
            console.error(`>>>`, char.info);
        }
        console.log(
            `${fixedCharacters.length} accounts left -- ${data} total processed items`
        );
        run(timer);
    };
    console.log('starting run');
    for (let i = 0; i < 25; i++) {
        console.log(`run#${i + 1}`);

        console.time(`processing-${i + 1}`);
        run(`processing-${i + 1}`)
            .then(() => {})
            .catch((error) => {
                console.error('Processing error:', error);
            });
    }
};

processItems(inputItems)
    .then(() => {
        console.log('finished');
    })
    .catch((error) => console.error(error));
