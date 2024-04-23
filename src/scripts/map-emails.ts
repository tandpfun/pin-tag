// pnpm tsc '/Users/thijs/Documents/projects/pin-tag/packages/website/src/scripts/map-emails.ts'
// yarn map-emails import_file blackbaud_file pintag_domain game_id

import { readFileSync, writeFileSync } from 'fs';

const main = async () => {
  const args = process.argv.slice(2);
  console.log(args);
  const usersFile = readFileSync(args[0], 'utf-8');

  const usersToImport = usersFile
    .split('\n')
    .map((line) => line.split(','))
    .map(([firstName, lastName, email]) => ({
      firstName,
      lastName,
      email: email,
    }));

  const emailsToAvatar = JSON.parse(readFileSync(args[1], 'utf-8'));

  // Find non matching names to emails
  const nonMatching = usersToImport
    .filter(
      (user) =>
        !emailsToAvatar[user.email] ||
        emailsToAvatar[user.email].firstName !== user.firstName ||
        emailsToAvatar[user.email].lastName !== user.lastName
    )
    .map((user) => ({
      ...user,
      preferredName:
        emailsToAvatar[user.email]?.firstName +
        ', ' +
        emailsToAvatar[user.email]?.lastName,
    }));

  console.log('Non matching users:', nonMatching);

  // Find duplicate emails
  const duplicates = usersToImport.filter(
    (u) => usersToImport.filter((u2) => u2.email === u.email).length > 1
  );
  if (duplicates.length > 0) {
    console.log('Duplicate emails:', duplicates);
    throw new Error('HAS DUPLICATES');
  }

  // return;

  const users = usersToImport.map((user) => ({
    ...user,
    avatar: emailsToAvatar[user.email].avatar,
    gradYear: parseInt(emailsToAvatar[user.email].gradYear),
  }));

  for (const user of users) {
    const createUser = await fetch(`${args[2]}/api/auth/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify(user),
    })
      .then((b) => b.json())
      .catch((err) => console.error(err));

    console.log(createUser);

    if (!createUser || createUser.error) continue;

    const joinGame = await fetch(`${args[2]}/api/games/${args[3]}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      },
      body: JSON.stringify({ userId: createUser.userId }),
    })
      .then((b) => b.json())
      .catch((err) => console.error(err));

    console.log(joinGame);
  }
};

main().catch(console.error);
