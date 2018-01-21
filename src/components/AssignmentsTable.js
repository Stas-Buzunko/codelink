import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import keycode from 'keycode';
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from 'material-ui/Table';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
import DeleteIcon from 'material-ui-icons/Delete';
import FilterListIcon from 'material-ui-icons/FilterList';
import _ from 'lodash'
import moment from 'moment'
import Button from 'material-ui/Button';


let counter = 0;
function createData(name, calories, fat, carbs, protein) {
  counter += 1;
  return { id: counter, name, calories, fat, carbs, protein };
}

const columnData = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Student', temp: { 'directions': 'blah', 'link': '' } },
  { id: 'desert', numeric: false, disablePadding: true, label: 'Code Combat', temp: { 'directions': 'Enter your Code Combat name', 'link': 'https://www.codecombat.com' } },
  { id: 'calories', numeric: false, disablePadding: false, label: 'Level One', temp: { 'directions': 'blah', 'link': '' } },
  { id: 'fat', numeric: false, disablePadding: false, label: 'Team Name', temp: { 'directions': 'blah', 'link': '' } },
  { id: 'carbs', numeric: false, disablePadding: false, label: 'Level Two', temp: { 'directions': 'blah', 'link': '' } },
  { id: 'protein', numeric: false, disablePadding: false, label: 'Level Three', temp: { 'directions': 'blah', 'link': '' } },
];

class EnhancedTableHead extends React.Component {
  static propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };

  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, assignments, editAssignment, instructorView } = this.props;

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          <TableCell
            key="name"
            numeric={false}
            padding={'none'}
            sortDirection={orderBy === 'name' ? order : false}
          >
            <Tooltip
              title="Sort"
              placement={'bottom-start'}
              enterDelay={300}
            >
              <TableSortLabel
                active={orderBy === 'name'}
                direction={order}
                onClick={this.createSortHandler('name')}
              >
                Student
              </TableSortLabel>
            </Tooltip>
            {/*<div>blah</div>
              <a href={'assignmentDetails/'} target="_blank">details</a>*/}
          </TableCell>

          {_.map(assignments, (assignment, assignmentKey) =>
            <TableCell
              key={assignmentKey}
              numeric={false}
              padding={'none'}
              sortDirection={orderBy === assignmentKey ? order : false}
            >
              <Tooltip
                title="Sort"
                placement={'bottom-start'}
                enterDelay={300}
              >
                <TableSortLabel
                  active={orderBy === assignmentKey}
                  direction={order}
                  onClick={this.createSortHandler(assignmentKey)}
                >
                  Assignment {assignment.title}
                </TableSortLabel>
              </Tooltip>
              <div>by {moment(assignment.deadline, 'x').format('YYYY-MM-DD')}</div>
              {false && instructorView && <a onClick={() => editAssignment(assignmentKey)} target="_blank">edit</a>}
            </TableCell>
          )}
        </TableRow>
      </TableHead>
    );
  }
}

const toolbarStyles = theme => ({
  root: {
    paddingRight: 2,
  },
  highlight:
  theme.palette.type === 'light'
    ? {
      color: theme.palette.secondary.A700,
      backgroundColor: theme.palette.secondary.A100,
    }
    : {
      color: theme.palette.secondary.A100,
      backgroundColor: theme.palette.secondary.A700,
    },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});

let EnhancedTableToolbar = props => {
  const { numSelected, classes, assignments } = props;

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography type="subheading">{numSelected} selected</Typography>
        ) : (
            <Typography type="title">Assignments</Typography>
          )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {numSelected > 0 ? (
          <Tooltip title="Remove from class">
            <IconButton aria-label="Delete">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
            <Tooltip title="Filter list">
              <IconButton aria-label="Filter list">
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}
      </div>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 800,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

class EnhancedTable extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      order: 'asc',
      orderBy: 'name',
      selected: [],
      data: [
        createData('Chris', 'profboesch', '', 'Team 1', '', ''),
        createData('Doug', 'deathknight', 'COMPLETE', 'Team 1', 'COMPLETE'),
        createData('Ellen', 'cookie', '', 'Team 1', ''),
        createData('Fred', 'fruit', 'COMPLETE', 'Team 1', 'COMPLETE'),
        createData('Ginger', 'awesome1', 'COMPLETE', 'Team 2', 'COMPLETE'),
        createData('Halley', 'hawk', 'COMPLETE', 'Team 2', ''),
        createData('Ivan', 'knight234', '', 'Team 3', ''),
        createData('Joey', 'faster', '', 'Team 3', ''),
        createData('Kate', 'renal', '', 'Team 3', ''),
        createData('Larry', 'crooked', '', 'Team 3', ''),
        createData('Mary', 'party1', '', '', ''),
        createData('Ned', 'slight', '', '', ''),
        createData('Oran', 'gogo', '', '', ''),
      ].sort((a, b) => (a.name < b.name ? -1 : 1)),
      page: 0,
      rowsPerPage: 5,
    };
  }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    const data =
      order === 'desc'
        ? this.state.data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
        : this.state.data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));

    this.setState({ data, order, orderBy });
  };

  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState({ selected: this.state.data.map(n => n.id) });
      return;
    }
    this.setState({ selected: [] });
  };

  handleKeyDown = (event, id) => {
    if (keycode(event) === 'space') {
      this.handleClick(event, id);
    }
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    this.setState({ selected: newSelected });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  render() {
    const { classes, assignments, students } = this.props;
    const { data, order, orderBy, selected, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <EnhancedTableHead
              assignments={assignments}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
            />
            <TableBody>
              {students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(user => {
                const isSelected = false
                const studentKey = Object.keys(user)[0]
                const name = user[studentKey]

                return (
                  <TableRow
                    hover
                    onClick={event => this.handleClick(event, studentKey)}
                    onKeyDown={event => this.handleKeyDown(event, studentKey)}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={-1}
                    key={studentKey}
                    selected={isSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isSelected} />
                    </TableCell>
                    <TableCell padding="none">{name}</TableCell>
                    {_.map(assignments, (assignment, assignmentKey) =>
                      <TableCell>
                        <Button raised>
                          Submit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  count={students.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  backIconButtonProps={{
                    'aria-label': 'Previous Page',
                  }}
                  nextIconButtonProps={{
                    'aria-label': 'Next Page',
                  }}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Paper>
    );
  }
}

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EnhancedTable);
