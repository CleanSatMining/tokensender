import { Title, Text } from '@mantine/core';
import classes from './Welcome.module.css';

export function Welcome() {
  return (
    <>
      <Title className={classes.title} ta="center" mt={0}>
        <Text
          inherit
          variant="gradient"
          component="span"
          gradient={{ from: 'green', to: 'yellow' }}
        >
          CleanSat Mining
        </Text>
      </Title>
      <Title className={classes.title} ta="center" mt={0}>
        VENTE CSM ALPHA
      </Title>

      <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
        {
          "Veuillez vérifier votre adresse de livraison des token CSM alpha en entrant votre adresse e-mail. Assurez-vous que l'adresse affiché correspond à celle que vous avez l'intention d'utiliser. Si l'adresse ne correspond pas à celle souhaitée, veuillez nous contacter à l'adresse "
        }
        <a href="mailto:contact@cleansatmining.com">contact@cleansatmining.com</a>{' '}
        {" pour obtenir de l'aide."}
        {/* <Anchor href="https://mantine.dev/guides/next/" size="lg">
          this guide
        </Anchor> */}
      </Text>
    </>
  );
}
