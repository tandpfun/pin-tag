import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  ColorScheme,
  Row,
  Column,
  Heading,
} from 'jsx-email';

import * as React from 'react';

export const TemplateName = 'TargetEmail';

const main = {
  color: 'white',
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

function gradYearToGrade(gradYear: number) {
  const currentYear = new Date().getFullYear();
  const grades = ['Senior', 'Junior', 'Sophomore', 'Frosh'];
  return grades[currentYear - gradYear];
}

export const Template = ({
  name = 'Thijs',
  assassin,
  eliminationLink,
}: {
  name: string;
  assassin?: { firstName: string; lastName: string; gradYear: number };
  eliminationLink: string;
}) => (
  <Tailwind production>
    <Head>
      <ColorScheme mode="dark only" />
    </Head>
    <Body style={main}>
      <Section bgcolor="#07101e" className="p-4">
        <Row>
          <Column>
            <Heading className="font-bold my-0 w-fit border-2 border-green-600 px-2 border-solid">
              PINTAG
            </Heading>
          </Column>
        </Row>
        <Row className="mt-4 p-4" bgcolor="#321821">
          <Column>
            <Text className="!my-0">
              Hello <span className="text-red-500">Agent {name}</span>
              ,
              <br />
              <br />
              You were eliminated from the game by{' '}
              {assassin ? (
                <b className="text-red-500">
                  {assassin.firstName} {assassin.lastName} &apos;
                  {assassin.gradYear.toString().substring(2)}
                </b>
              ) : (
                'one of the event organizers'
              )}
              .
              <br />
              <br />
              {assassin && (
                <>
                  We may offer a revival round in the future! Check your email
                  often so you don&apos;t miss it. Feel free to reply to this
                  email with any concerns or questions.
                  <br />
                  <br />
                </>
              )}
              Open your{' '}
              <Button
                href={eliminationLink}
                className="text-blue-500 underline font-bold"
              >
                <u>mission portal</u>
              </Button>{' '}
              for more information.
              <br />
              <br />
              Better luck next time,
              <br />
              <span className="text-red-500">Pin-Tag Organizers</span>
            </Text>
          </Column>
        </Row>
      </Section>
    </Body>
  </Tailwind>
);
