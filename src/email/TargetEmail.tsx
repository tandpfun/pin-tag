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
  //backgroundColor: 'black',
  color: 'white',
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

function gradYearToGrade(gradYear: number) {
  const currentYear = new Date().getFullYear();
  const grades = ['Senior', 'Junior', 'Sophomore', 'Frosh'];
  return grades[currentYear - gradYear];
}

const container = {
  padding: '20px',
  marginBottom: '64px',
};

export const Template = ({
  name = 'Thijs',
  target = { firstName: 'John', lastName: 'Doe', gradYear: 2024 },
  eliminationLink,
}: {
  name: string;
  target: { firstName: string; lastName: string; gradYear: number };
  eliminationLink: string;
}) => (
  <Tailwind production>
    <Head>
      <ColorScheme mode="dark only" />
    </Head>
    <Preview>You've been assigned a target!</Preview>
    <Body style={main}>
      <Section bgcolor="#07101e" className="sm:p-8 p-4">
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
              You've been assigned a target! Your goal is to pin{' '}
              <span className="text-green-500">
                {target.firstName} {target.lastName} &apos;
                {target.gradYear.toString().substring(2)}
              </span>
              . Be sure to follow all of the rules, which are listed below.
              <br />
              <br />
              Once you pin{' '}
              <span className="text-green-500">{target.firstName}</span>
              , tap the "Eliminate" button below to receive your next target.
              <br />
              <br />
              Your target will be updated periodically throughout the event, so
              be sure to check your email often!
              <br />
              <br />
              Best of luck,
              <br />
              <span className="text-green-500">FBI Director Kim</span>
            </Text>
          </Column>
        </Row>
        <Row className="mt-4 p-4" bgcolor="#321821">
          <Column>
            <Heading className="font-bold my-0 text-red-600 mb-2" as="h3">
              TARGET
            </Heading>
            <Text className="!my-0">
              Name: {target.firstName} {target.lastName}
              <br />
              Grade: {gradYearToGrade(target.gradYear)}
            </Text>
            <Button
              href={eliminationLink}
              className="px-3 py-2 border-2 border-red-500 border-solid mt-2 !text-white"
            >
              Eliminate {target.firstName}
            </Button>
          </Column>
        </Row>
        <Row className="mt-4 p-4" bgcolor="#241946">
          <Column>
            <Heading className="font-bold my-0 text-purple-600 mb-2" as="h3">
              RULES
            </Heading>
            <Text className="!my-0">
              <ul className="m-0 pl-4">
                <li>Game hours: 8:50am - 4:00pm</li>
                <li>No pinning during class periods</li>
                <li>Safe zones: classrooms, library</li>
                <li>No running, sneak up on your target instead</li>
              </ul>
            </Text>
          </Column>
        </Row>
      </Section>
    </Body>
  </Tailwind>
);
