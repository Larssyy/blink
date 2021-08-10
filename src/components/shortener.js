import { Fragment, useState } from 'react'
import { useNotify, usePermissions } from 'react-admin'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import SearchIcon from '@material-ui/icons/Search'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import { subject } from '@casl/ability'
import validator from '../providers/validator'
import { FORM_ERROR } from 'final-form'
import { Form, Field } from 'react-final-form'
// TODO: test all this shit locally

export default function LinkShortener() {
  const [isOpen, setIsOpen] = useState(false)
  const notify = useNotify()
  const { loading: permissionsLoading, permissions } = usePermissions()

  async function shortenLink(values, form) {
    try {
      const result = await fetch('/api/links', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!result.ok) throw new Error(await result.text())
      const link = await result.json()

      form.initialize(link)
      notify('Shortened link!')
    } catch (err) {
      notify(err.message, 'error')
      return { [FORM_ERROR]: err.message }
    }
  }

  const ShortenerForm = () => (
    <Form
      validate={validator('Link')}
      onSubmit={shortenLink}
      render={({ handleSubmit, submitting, values, pristine, invalid }) => {
        const resource = subject('Link', values)

        return (
          <form onSubmit={handleSubmit}>
            <Field name="originalUrl">
              {({ input, meta }) => (
                <>
                  <TextField
                    name={input.name}
                    value={input.value}
                    onChange={input.onChange}
                    autoFocus
                    variant="filled"
                    label="Paste link to shorten"
                    placeholder="example.com"
                    error={meta.invalid}
                    helperText={meta.error}
                    disabled={
                      submitting || permissions.cannot('create', resource) // check if you're allowed to shorten link
                    }
                    data-testid="originalUrl-field"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="shorten"
                            data-testid="shorten-button"
                            color="secondary"
                            disabled={submitting || pristine || invalid}
                            type="submit"
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </>
              )}
            </Field>
            <Field name="hash">
              {({ input, meta }) => (
                <>
                  <TextField
                    name={input.name}
                    value={input.value}
                    onChange={input.onChange}
                    variant="filled"
                    label="Custom URL"
                    placeholder={
                      values.shortenedUrl
                        ? values.shortenedUrl.split('/').pop()
                        : 'awesome-link'
                    }
                    data-testid="hash-field"
                    error={meta.invalid}
                    helperText={meta.error}
                    disabled={
                      submitting ||
                      (!values.hash &&
                        permissions.cannot('create', resource, 'hash')) || // if the hash is not set, deny if you can't create hash
                      (values.hash &&
                        permissions.cannot('update', resource, 'hash')) // if the hash is set, deny if you can't update hash
                    }
                    style={{ marginTop: '2rem', paddingBottom: '1rem' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment
                          position="start"
                          style={{ marginRight: 0, marginBottom: '-3px' }}
                        >
                          {process.env.REACT_APP_BASE_URL}/
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <CopyToClipboard
                            text={values.brandedUrl || values.shortenedUrl}
                            data-testid="copy-button"
                          >
                            <IconButton
                              aria-label="copy link"
                              color="secondary"
                              disabled={submitting || !values.shortenedUrl} // disable copy when there's nothing to copy
                              onClick={() => notify('Link copied!')}
                            >
                              <FileCopyIcon />
                            </IconButton>
                          </CopyToClipboard>
                        </InputAdornment>
                      )
                    }}
                  />
                </>
              )}
            </Field>
          </form>
        )
      }}
    />
  )

  return (
    <Fragment>
      <IconButton
        aria-label="add"
        color="primary"
        onClick={() => setIsOpen(true)}
        data-testid="open-button"
      >
        <AddIcon />
      </IconButton>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        aria-labelledby="form-dialog-title"
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle id="form-dialog-title">Shorten Link</DialogTitle>
        <DialogContent>
          {permissionsLoading ? <div>Loading...</div> : <ShortenerForm />}
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}
