const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('when logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('Can see blog create form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('and using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    test('form shows an error message', async () => {
      const titleWarning = await page.getContentsOf('.title .red-text');
      const contentWarning = await page.getContentsOf('.content .red-text');
      expect(titleWarning).toEqual('You must provide a value');
      expect(contentWarning).toEqual('You must provide a value');
    });
  });

  describe('and using valid form inputs', async () => {
    beforeEach(async () => {
      await page.type('input[name="title"]', 'New blog');
      await page.type('input[name="content"]', 'Lovely blog I have here.');
      await page.click('form button');
    });

    test('submitting takes user to the review screen', async () => {
      const text = await page.getContentsOf('form h5');
      expect(text).toEqual('Please confirm your entries');
    });

    test('submitting then saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');
      expect(title).toEqual('New blog');
      expect(content).toEqual('Lovely blog I have here.');
    });
  });
});

describe('when not logged in', async () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs',
    },
    {
      method: 'post',
      path: '/api/blogs/',
      data: {
        title: 'T',
        content: 'C',
      }
    }
  ];

  test('user is prevented from performing blog-related actions', async () => {
    const results = await page.execRequests(actions);
    
    for (let result of results) {
      expect(result).toEqual({ error: 'You must log in!' });
    }
  });
  // test('user cannot create blog posts', async () => {
  //   const result = await page.post('/api/blogs', { title: 'My title', content: 'My Content' });
  //   expect(result).toHaveProperty('error', 'You must log in!');
  // });

  // test('user cannot retrieve a list of blog posts', async () => {
  //   const result = await page.get('/api/blogs');
  //   expect(result).toHaveProperty('error', 'You must log in!');
  // });
});