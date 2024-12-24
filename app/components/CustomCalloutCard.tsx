import {CalloutCard} from '@shopify/polaris';
import React from 'react';

interface Props {
  title: string;
  illustration: string;
  primaryActioncontent: string;
  primaryActionUrl: string;
  children: React.ReactNode;
}

export default function CustomCalloutCard(props: Props) {
    const { title, illustration, primaryActioncontent, primaryActionUrl, children } = props;

  return (
    <CalloutCard
      title={title}
      illustration={illustration}
      primaryAction={{
        content: primaryActioncontent,
        url: primaryActionUrl,
      }}
    >
     <br/>
     {children}
    </CalloutCard>
  );
}