import * as React from "react";
import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Section,
    Text,
    Img,
    Heading,
    Hr,
    Button,
    Link,
    Tailwind,
    Row,
    Column,
} from "react-email";

interface DailyTipEmailProps {
    firstName: string | null;
}

export default function DailyTipEmail({ firstName }: DailyTipEmailProps) {
    const greeting = firstName ? `Hi ${firstName},` : "Hi there!";

    return (
        <Html lang="en">
            <Tailwind>
                <Head />
                <Preview>A quick tip to make your product demos look way better.</Preview>

                <Body className="my-auto mx-auto font-sans text-gray-200">
                    <Container className="border border-solid border-[#222222] bg-[#000000] rounded-md my-[40px] mx-auto p-[40px] max-w-[480px]">

                        <Section className="mb-[32px]">
                            <Img
                                src="https://openvid.dev/images/pages/openvid.svg"
                                height="32"
                                alt="OpenVid Logo"
                                className="block"
                            />
                        </Section>

                        <Heading className="text-white text-[24px] font-semibold p-0 my-[24px] mx-0">
                            Ready for your next demo?
                        </Heading>

                        <Text className="text-gray-300 text-[14px] leading-[24px]">
                            {greeting}
                        </Text>

                        <Text className="text-gray-300 text-[14px] leading-[24px]">
                            Next time you jump into the editor, try placing your recording inside one of our 3D mockups and add a camera pan. It only takes a couple of clicks, but the final output looks incredibly professional.
                        </Text>

                        <Text className="text-gray-300 text-[14px] leading-[24px]">
                            The best part is that everything runs directly in your browser, so you can export the final result in 4K within seconds.
                        </Text>

                        <Section className="mt-[32px] mb-[32px]">
                            <Button
                                href="https://openvid.dev/en/editor"
                                className="bg-white rounded-md text-black text-[14px] font-semibold no-underline px-[20px] py-[12px] block text-center transition-opacity hover:opacity-80"
                            >
                                Open the editor
                            </Button>
                        </Section>

                        <Hr className="border border-solid border-[#222222] my-[24px] mx-0 w-full" />

                        <Section>
                            <Row>
                                <Column align="left">
                                    <Link
                                        style={{ color: "#9ca3af" }}
                                        className="text-gray-400 text-[12px] underline transition-colors hover:text-gray-300"
                                        href="https://openvid.dev/en"
                                    >
                                        Website
                                    </Link>
                                </Column>
                                <Column align="center">
                                    <Link
                                        style={{ color: "#9ca3af" }}
                                        className="text-gray-400 text-[12px] underline transition-colors hover:text-gray-300"
                                        href="https://discord.com/invite/aBu5A2tBXb"
                                    >
                                        Discord
                                    </Link>
                                </Column>
                                <Column align="right">
                                    <Link
                                        style={{ color: "#9ca3af" }}
                                        className="text-gray-400 text-[12px] underline transition-colors hover:text-gray-300"
                                        href="https://github.com/CristianOlivera1/openvid"
                                    >
                                        GitHub
                                    </Link>
                                </Column>
                            </Row>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
