import type {Stack} from 'aws-cdk-lib';
import {aws_apigateway} from 'aws-cdk-lib';
import type {StackConfig} from '../../types';

export function createUnauthorizedGatewayResponse(
  stackConfig: StackConfig,
  stack: Stack,
  restApi: aws_apigateway.RestApi,
): void {
  if (!stackConfig.basicAuthenticationConfig) {
    return;
  }

  const {interactivePromptForXhr, realm} =
    stackConfig.basicAuthenticationConfig;

  const corsHeader: {[key: string]: string} = stackConfig.enableCors
    ? interactivePromptForXhr
      ? {
          'gatewayresponse.header.Access-Control-Allow-Origin': `method.request.header.origin`,
          'gatewayresponse.header.Access-Control-Allow-Credentials': `'true'`,
          'gatewayresponse.header.Access-Control-Allow-Headers': `'Authorization,*'`,
        }
      : {
          'gatewayresponse.header.Access-Control-Allow-Origin': `'*'`,
        }
    : {};

  // TODO: use GatewayResponse instead of CfnGatewayResponse
  new aws_apigateway.CfnGatewayResponse(
    stack,
    `ApiGatewayUnauthorizedResponse`,
    {
      statusCode: `401`,
      responseType: `UNAUTHORIZED`,
      restApiId: restApi.restApiId,
      responseParameters: {
        'gatewayresponse.header.WWW-Authenticate': realm
          ? `'Basic realm=${realm}'`
          : `'Basic'`,
        ...corsHeader,
      },
      responseTemplates: {
        'application/json': `{"message":$context.error.messageString}`,
        'text/html': `$context.error.message`,
      },
    },
  );

  // Intentionally not adding the restApi as a dependency here. With a defined
  // dependency the api gateway would be deployed first, and only afterwards the
  // gateway response would be added. This would require an additional
  // deployment. We don't really need the dependency, since we are only
  // interested in the restApiId (see above), which can be computed beforehand.
  // Omitting the dependency allows the CDK to deploy the api gateway already
  // with the gateway response defined, so that no additional deployment would
  // be needed.
}
