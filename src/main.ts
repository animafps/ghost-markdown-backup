import * as core from '@actions/core'
import GhostContentAPI from '@tryghost/content-api'
import exec from '@actions/exec'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'

const api = new GhostContentAPI({
  url: core.getInput('url'),
  key: core.getInput('key'),
  version: core.getInput('version')
})

const createMdFilesFromGhost = async (): Promise<unknown> => {
  // fetch the posts from the Ghost Content API
  const posts = await api.posts.browse({include: 'tags,authors'})

  return Promise.all(
    posts.map(async (post: {html: unknown; slug: unknown}) => {
      // Save the content separate and delete it from our post object, as we'll create
      // the frontmatter properties for every property that is left
      const content = post.html
      delete post.html

      const frontmatter = post

      // Create frontmatter properties from all keys in our post object
      const yamlPost = yaml.dump(frontmatter)

      // Super simple concatenating of the frontmatter and our content
      const fileString = `---\n${yamlPost}\n---\n${content}\n`

      // Save the final string of our file as a Markdown file
      await fs.writeFile(path.join('', `${post.slug}.md`), fileString)
    })
  )
}

async function run(): Promise<void> {
  try {
    await createMdFilesFromGhost()
    await exec.exec('git', [
      'config',
      '--global',
      'user.email',
      'ghost-markdown-backup@example.com'
    ])
    await exec.exec('git', [
      'config',
      '--global',
      'user.name',
      'ghost-markdown-backup[bot]'
    ])
    await exec.exec('git', ['add', '.'])
    await exec.exec('git', ['commit', '-m', 'Backup Ghost posts to markdown'])
    await exec.exec('git', ['push'])
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
