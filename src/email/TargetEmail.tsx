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
  target = { firstName: 'John', lastName: 'Doe', gradYear: 2024 },
  eliminationLink = 'https://google.com',
  isNew = false,
  isRevival = false,
}: {
  name: string;
  target: { firstName: string; lastName: string; gradYear: number };
  eliminationLink: string;
  isNew?: boolean;
  isRevival?: boolean;
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
        <Row className="mt-4 p-4" bgcolor="#0D2E28">
          <Column>
            <Text className="!my-0">
              Hello <span className="text-green-500">Agent {name}</span>
              ,
              <br />
              <br />
              {isRevival ? 'You have been revived! Your NEW' : 'Your '}
              {isNew ? 'target has been updated. Your NEW' : ''} target is{' '}
              <span className="text-green-500 font-bold">
                {target.firstName} {target.lastName} &apos;
                {target.gradYear.toString().substring(2)}
              </span>
              .
              <br />
              <br />
              Open your{' '}
              <Button
                href={eliminationLink}
                className="text-blue-500 underline font-bold"
              >
                <u>mission portal</u>
              </Button>{' '}
              to mark them as eliminated, and receive your next target. Your
              target may be updated during the game, so be sure to check your
              email often!
              <br />
              <br />
              Best of luck,
              <br />
              <span className="text-green-500">
                FBI Directors Nate & Mateus
              </span>
            </Text>
          </Column>
        </Row>
        <Row className="mt-4 p-4" bgcolor="#321821">
          <Column>
            <Heading className="font-bold my-0 text-red-600 mb-2" as="h3">
              YOUR {isNew ? 'NEW' : ''} TARGET
            </Heading>
            <Text className="!my-0">
              <strong>Name:</strong> {target.firstName} {target.lastName}
              <br />
              <strong>Grade</strong>: {gradYearToGrade(target.gradYear)}
              <br />
              <Button
                href={eliminationLink}
                className="px-3 py-2 border-2 border-red-500 border-solid mt-2 !text-white"
              >
                Open Mission Portal
              </Button>
            </Text>
          </Column>
        </Row>
      </Section>
    </Body>
  </Tailwind>
);
