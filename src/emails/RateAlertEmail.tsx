import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface RateAlertEmailProps {
    rate: number;
    amount: number;
    baseCurrency: 'EUR' | 'CHF';
    date: string;
}

export const RateAlertEmail = ({
    rate,
    amount,
    baseCurrency,
    date,
}: RateAlertEmailProps) => {
    const isBaseEur = baseCurrency === 'EUR';
    const amountEur = isBaseEur ? amount : amount / rate;
    const amountChf = isBaseEur ? amount * rate : amount;

    const previewText = `Today's Frank rate is ${rate.toFixed(4)}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Frank's Friendly Fixing</Heading>

                    <Text style={text}>
                        Hello,
                    </Text>
                    <Text style={text}>
                        You scheduled an exchange alert for today ({date}). Here is the official ECB exchange rate and the exact amounts to swap:
                    </Text>

                    <Section style={rateSection}>
                        <Text style={rateTitle}>Frank's Rate (EUR/CHF)</Text>
                        <Text style={rateValue}>{rate.toFixed(4)}</Text>
                    </Section>

                    <Section style={amountsSection}>
                        <Text style={amountText}>
                            <strong>Person A</strong> sends: {amountEur.toFixed(2)} EUR
                        </Text>
                        <Text style={amountText}>
                            <strong>Person B</strong> sends: {amountChf.toFixed(2)} CHF
                        </Text>
                    </Section>

                    <Text style={footer}>
                        No fees. No spread. Just a fair exchange between mates. <br />
                        Frank does not process this transaction.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: '#f8fafc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '560px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    marginTop: '40px',
};

const h1 = {
    color: '#0f172a',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '10px 0 30px',
};

const text = {
    color: '#334155',
    fontSize: '16px',
    lineHeight: '24px',
};

const rateSection = {
    backgroundColor: '#f1f5f9',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center' as const,
    margin: '32px 0',
};

const rateTitle = {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 0 8px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
};

const rateValue = {
    color: '#0ea5e9', // frank-blue equivalent
    fontSize: '48px',
    fontWeight: '900',
    margin: '0',
    fontFamily: 'SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
    lineHeight: '1',
};

const amountsSection = {
    borderLeft: '4px solid #0ea5e9',
    paddingLeft: '16px',
    margin: '32px 0',
};

const amountText = {
    color: '#0f172a',
    fontSize: '18px',
    lineHeight: '28px',
    margin: '8px 0',
};

const footer = {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    marginTop: '40px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '20px',
};

export default RateAlertEmail;
