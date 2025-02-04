import Prisma from '../prisma.js'
import fetch from 'node-fetch'

export default async (req, res) => {
  const {code, state: recordID} = req.query
  const user = await Prisma.find('authedAccount', recordID)

  if (user) {
    const tokenUrl = 'https://slack.com/api/oauth.v2.access' +
                      `?code=${code}` +
                      `&client_id=${process.env.SLACK_CLIENT_ID}` +
                      `&client_secret=${process.env.SLACK_CLIENT_SECRET}` +
                      `&redirect_uri=${encodeURIComponent('https://hack.af/z/slack-auth')}`
    const slackData = await fetch(tokenUrl, {method: 'post'}).then(r => r.json())
    await Prisma.patch('authedAccount', recordID, { slackID: slackData['authed_user']['id'] })
    // res.status(200).send('It worked! You can close this tab now')
    res.redirect('/auth-success.html')
  } else {
    // oh, we're far off the yellow brick road now...
    // res.status(422).send('Uh oh...')
    res.redirect('/auth-error.html')
  }
}